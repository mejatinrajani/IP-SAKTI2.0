import os
import json
import logging
from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import asyncio
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from supabase import create_client, Client
from neo4j import GraphDatabase
from core.dual_rag_engine import rag_engine
from schemas import JurisdictionMode
from core.entity_resolver import entity_resolver
from core.prior_art import search_existing_patents

load_dotenv()
logger = logging.getLogger("ORCHESTRATOR")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
class GraphState(TypedDict):
    user_prompt: str
    user_language: str
    extracted_plants: list[str]
    extracted_claims: str
    dmr_evaluation: dict
    final_report: dict
    prior_art_warnings: list[dict] # Add this exact line
# ---------------------------------------------------------
# 1. PYDANTIC SCHEMAS FOR STRUCTURED VALIDATION
# ---------------------------------------------------------
class ExtractedEntities(BaseModel):
    plants: List[str] = Field(
        default_factory=list, 
        description="List of botanical or common plant names mentioned in the prompt."
    )
    therapeutic_claims: str = Field(
        default="", 
        description="The medical, therapeutic, or health claims asserted by the user."
    )
    intended_use_type: str = Field(
        default="therapeutic",
        description="Category of use: 'therapeutic', 'cosmetic', 'nutraceutical', or 'preventive'."
    )

class DMRValidationResult(BaseModel):
    is_violation: bool = Field(
        ..., 
        description="True if the claim asserts a cure, prevention, or treatment for any statutory prohibited disease."
    )
    prohibited_disease_matched: Optional[str] = Field(
        default=None, 
        description="The exact disease from the DMR Schedule that is triggered, if any."
    )
    legal_reasoning: str = Field(
        ..., 
        description="Statutory legal basis citing Section 3(d) of DMR Act 1954 or Schedule J."
    )

# ---------------------------------------------------------
# 2. GRAPH STATE DEFINITION
# ---------------------------------------------------------
class OrchestratorState(TypedDict):
    user_prompt: str
    extracted_plants: List[str]
    extracted_claims: str
    intended_use_type: str
    dmr_evaluation: Dict[str, Any]
    neo4j_regulatory: List[Dict[str, Any]]
    supabase_biological: Dict[str, Any]
    final_report: Dict[str, Any]

# ---------------------------------------------------------
# 3. CLIENTS & LLM INITIALIZATION
# ---------------------------------------------------------
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# Structured & Standard LLM instances via Groq
groq_api_key = os.getenv("GROQ_API_KEY_3")
base_llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=groq_api_key,
    temperature=0
)

structured_extractor = base_llm.with_structured_output(ExtractedEntities)
structured_dmr_grader = base_llm.with_structured_output(DMRValidationResult)

# ---------------------------------------------------------
# 4. NODE DEFINITIONS
# ---------------------------------------------------------
async def extract_entities(state: OrchestratorState) -> OrchestratorState:
    """Agent 1: Extracts entities with Pydantic schema enforcement and resolves aliases."""
    logger.info("🧠 Node 1: Extracting Entities with Pydantic Schema...")
    prompt = state["user_prompt"]
    
    system_prompt = (
        "You are an expert Indian regulatory data extraction agent. "
        "Extract all plant entities (scientific, Ayurvedic, Hindi, or trade names) "
        "and the specific therapeutic claims asserted."
    )
    
    try:
        extraction: ExtractedEntities = await structured_extractor.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt)
        ])
        
        # Resolve extracted common/vernacular names via Fulltext & Canonical Registry
        resolved_plants = entity_resolver.resolve_plant_list(extraction.plants)
        
        state["extracted_plants"] = resolved_plants
        state["extracted_claims"] = extraction.therapeutic_claims
        state["intended_use_type"] = extraction.intended_use_type
        
        logger.info(f"   ↳ Raw Extracted: {extraction.plants}")
        logger.info(f"   ↳ Canonical Resolved: {state['extracted_plants']}")
        logger.info(f"   ↳ Claims: '{state['extracted_claims']}' ({state['intended_use_type']})")
    except Exception as e:
        logger.error(f"Pydantic Entity Extraction Error: {e}")
        state["extracted_plants"] = []
        state["extracted_claims"] = prompt
        state["intended_use_type"] = "therapeutic"
        
    return state

async def evaluate_dmr_compliance(state: OrchestratorState) -> OrchestratorState:
    """Agent 2: Context-aware evaluation against the 59 DMR 1954 prohibited diseases."""
    logger.info("⚖️ Node 2: Context-Aware DMR 1954 Statutory Evaluation...")
    claims = state.get("extracted_claims") or state["user_prompt"]
    
    # 1. Pull the 59 prohibited diseases from Supabase
    try:
        dmr_res = supabase.table("dmr_prohibited_diseases").select("disease_name").execute()
        banned_list = [row["disease_name"] for row in dmr_res.data] if dmr_res.data else []
    except Exception as e:
        logger.error(f"Failed to fetch DMR table: {e}")
        banned_list = ["Diabetes", "Cancer", "Blindness", "Asthma", "Heart Disease", "Kidney Stones", "Paralysis"]

    # 2. Context-Aware LLM Evaluator (Distinguishes actual cure claims from legitimate non-curative research)
    # 2. Context-Aware LLM Evaluator (Distinguishes actual cure claims from legitimate non-curative research)
    dmr_prompt = f"""You are a senior legal examiner under the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 and Rule 106 (Schedule J) of the Drugs and Cosmetics Rules, 1945.

List of Statutorily Prohibited Conditions/Diseases:
{json.dumps(banned_list)}

CRITICAL LEGAL SYNONYM MAPPING:
- "Arthritis" or "Severe Joint Pain" MUST be classified as the prohibited disease "Rheumatism".
- "Blood sugar" issues MUST be classified as the prohibited disease "Diabetes".
- "Vision loss" or "Cataracts" MUST be classified as the prohibited disease "Blindness".
- "Tumor" MUST be classified as "Cancer".

User's Asserted Claim:
"{claims}"

Task:
Determine if the claim legally constitutes an assertion of cure, mitigation, diagnosis, or treatment for any of the prohibited diseases. 
If the claim mentions ANY of the mapped conditions above (like Arthritis), you MUST set 'is_violation' to True and explicitly name the prohibited disease it maps to.
Permissible non-infringing claims include: general wellness, cosmetic moisturization, dietary nourishment, or scientific in-vitro assay references that explicitly disclaim clinical cures."""

    try:
        result: DMRValidationResult = await structured_dmr_grader.ainvoke([
            SystemMessage(content=dmr_prompt),
            HumanMessage(content="Evaluate compliance and return structured statutory findings.")
        ])
        state["dmr_evaluation"] = result.model_dump()
        logger.info(f"   ↳ DMR Violation Flag: {result.is_violation} (Matched: {result.prohibited_disease_matched})")
    except Exception as e:
        logger.error(f"DMR Evaluation Error: {e}")
        # Fallback conservative check
        matched = next((d for d in banned_list if d.lower() in claims.lower()), None)
        state["dmr_evaluation"] = {
            "is_violation": bool(matched),
            "prohibited_disease_matched": matched,
            "legal_reasoning": f"Triggered keyword match for {matched} under DMR Act Schedule." if matched else "No direct violation detected."
        }
        
    return state

async def query_neo4j_regulatory(state: OrchestratorState) -> OrchestratorState:
    """Agent 3: Traverses Neo4j graph based on extracted plants AND user intent."""
    logger.info("🏛️ Node 3: Querying Neo4j Regulatory Graph...")
    plants = state["extracted_plants"]
    user_intent = state.get("user_prompt", "").lower()
    regulatory_data = []
    
    if not plants:
        state["neo4j_regulatory"] = regulatory_data
        return state
        
    # Dynamically determine the required NBA form based on intent
    requires_patent = "patent" in user_intent or "ip" in user_intent
    target_nba_form = "Form 8" if requires_patent else "Form 9"
        
    query = """
    MATCH (p:Plant)-[r]->(target)
    WHERE p.botanical_name IN $plants
    // Filter out irrelevant NBA forms based on user intent
    AND NOT (target.name = 'Form 8' AND $target_nba_form = 'Form 9')
    AND NOT (target.name = 'Form 9' AND $target_nba_form = 'Form 8')
    RETURN p.botanical_name AS plant, 
           type(r) AS relationship, 
           target.name AS target_name,
           labels(target)[0] AS target_label
    """
    try:
        with driver.session() as session:
            result = session.run(query, plants=plants, target_nba_form=target_nba_form)
            for record in result:
                regulatory_data.append({
                    "plant": record["plant"],
                    "relationship": record["relationship"],
                    "target_name": record["target_name"],
                    "target_label": record["target_label"]
                })
        logger.info(f"   ↳ Retrieved {len(regulatory_data)} intent-filtered regulatory vectors.")
    except Exception as e:
        logger.error(f"Neo4j Query Error: {e}")
        
    state["neo4j_regulatory"] = regulatory_data
    return state

async def query_supabase_biological(state: OrchestratorState) -> OrchestratorState:
    """Agent 4: Extracts multi-compound phytochemical, ADMET, and therapeutic profiles."""
    logger.info("🧪 Node 4: Querying Supabase Biological Matrices...")
    plants = state["extracted_plants"]
    bio_data = {
        "traditional_therapeutics": [],
        "active_compounds": []
    }
    
    if not plants:
        state["supabase_biological"] = bio_data
        return state

    for plant in plants:
        try:
            # 1. Retrieve Traditional Ayurvedic / Ethnomedicinal Uses
            thera_res = supabase.table("imppat_therapeutics") \
                .select("plant_part, therapeutic_use") \
                .ilike("plant_name", f"%{plant}%") \
                .limit(5) \
                .execute()
                
            if thera_res.data:
                for row in thera_res.data:
                    bio_data["traditional_therapeutics"].append({
                        "plant": plant,
                        "plant_part": row.get("plant_part"),
                        "use": row.get("therapeutic_use")
                    })

            # 2. Retrieve Top Phytochemicals & ADMET (Expanded to top 3 per plant)
            parts_res = supabase.table("imppat_plant_parts") \
                .select("imppat_id, plant_part, imppat_phytochemicals(name)") \
                .ilike("plant_name", f"%{plant}%") \
                .limit(3) \
                .execute()
                
            for item in parts_res.data:
                imppat_id = str(item.get("imppat_id"))
                chem_data = item.get("imppat_phytochemicals")
                raw_name = chem_data.get("name", "") if chem_data else "Unknown"
                clean_name = raw_name.split("Summary")[0].split("\n")[0].strip()
                
                admet_res = supabase.table("imppat_admet") \
                    .select("molecular_weight, logp, tpsa, lipinski_rule_of_5") \
                    .eq("imppat_id", imppat_id) \
                    .maybe_single() \
                    .execute()
                    
                ad_data = admet_res.data if admet_res and admet_res.data else {}
                
                bio_data["active_compounds"].append({
                    "plant": plant,
                    "compound_name": clean_name,
                    "imppat_id": imppat_id,
                    "plant_part": item.get("plant_part"),
                    "molecular_weight": ad_data.get("molecular_weight"),
                    "logp": ad_data.get("logp"),
                    "tpsa": ad_data.get("tpsa"),
                    "lipinski_status": ad_data.get("lipinski_rule_of_5")
                })
        except Exception as e:
            logger.error(f"Supabase Biological Query Error for {plant}: {e}")
            
    state["supabase_biological"] = bio_data
    return state

def synthesize_report(state: OrchestratorState) -> OrchestratorState:
    """Agent 5: Synthesizes dual-jurisdiction (National & International) regulatory findings."""
    logger.info("📝 Node 5: Synthesizing Formal Statutory Dossier...")
    
    dmr_info = state.get("dmr_evaluation", {})
    
    system_prompt = """You are a Principal Patent & Global Regulatory Examiner for the Ministry of Ayush, Government of India.
Using the provided regulatory ontology (Neo4j), biological matrices (Supabase), and DMR statutory evaluation, compile a definitive, rigorous regulatory clearance report.

CRITICAL INSTRUCTION:
Do not invent or hallucinate legal sections. Base your legal reasoning strictly on the provided Neo4j regulatory vectors and DMR evaluation payload.
If `is_violation` is True in the DMR payload, you MUST set the overall Statutory Decision to "REJECTED - STATUTORY VIOLATION" and heavily cite Section 3(d) of the DMR Act (1954).

You MUST format your response strictly into two separate sections using these exact delimiters:

===NATIONAL_REPORT===
# National Regulatory Clearance Report (India)
1. Executive Summary & Statutory Decision (APPROVED / REJECTED / CONDITIONAL).
2. Schedule E(1) Toxicity & Safety Directives.
3. Biological Diversity Act (BDA 2002).
4. Drugs & Magic Remedies Act (1954) & Schedule J Compliance.
5. Phytochemical & ADMET Matrix Summary.
6. Mandatory Action Checklist.

===INTERNATIONAL_REPORT===
# International Export & Global Compliance Dossier
1. US FDA Assessment (21 CFR Part 111 / DSHEA).
2. European Union (EMA) Compliance (THMPD 2004/24/EC).
3. Global Labeling & Claim Substantiation.
4. Export Clearance Directives."""

    user_payload = {
        "extracted_plants": state["extracted_plants"],
        "asserted_claims": state["extracted_claims"],
        "dmr_statutory_evaluation": dmr_info,
        "neo4j_regulatory_vectors": state["neo4j_regulatory"],
        "supabase_biological_data": state["supabase_biological"],
        "exact_statutory_text": state.get("rag_context", "")
    }

    try:
        response = base_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=json.dumps(user_payload, indent=2))
        ])
        
        raw_content = response.content
        national_content = raw_content
        international_content = ""
        
        if "===INTERNATIONAL_REPORT===" in raw_content:
            parts = raw_content.split("===INTERNATIONAL_REPORT===")
            national_content = parts[0].replace("===NATIONAL_REPORT===", "").strip()
            international_content = parts[1].strip()
        else:
            national_content = raw_content.replace("===NATIONAL_REPORT===", "").strip()

        state["final_report"] = {
            "status": "success",
            "content": national_content, # Fallback
            "national_content": national_content,
            "international_content": international_content,
            "dmr_violation": dmr_info.get("is_violation", False),
            "prohibited_disease": dmr_info.get("prohibited_disease_matched")
        }
    except Exception as e:
        logger.error(f"Synthesis failed: {e}")
        state["final_report"] = {"status": "error", "content": "Statutory synthesis failed."}
        
    return state

async def check_prior_art_node(state: GraphState):
    logger.info("🔍 Searching for Prior Art / Existing Patents...")
    plants = state.get("extracted_plants", [])
    claims = state.get("extracted_claims", "")
    
    if plants:
        patents = search_existing_patents(plants, claims)
    else:
        patents = []
        
    return {"prior_art_warnings": patents}

async def query_statutory_rag(state: OrchestratorState) -> OrchestratorState:
    """Agent 4.5 (Async): Fetches exact legal texts from Vector DB to prevent LLM hallucination."""
    logger.info("📚 Node 4.5: Grounding with exact statutory text via RAG...")
    
    regulatory_vectors = state.get("neo4j_regulatory", [])
    if not regulatory_vectors:
        state["rag_context"] = "No specific statutory text required."
        return state
        
    # Build a targeted query based on Neo4j findings
    query_parts = ["Provide the exact legal text and requirements for:"]
    for reg in regulatory_vectors:
        query_parts.append(f"- {reg['target_name']}")
        
    if state.get("dmr_evaluation", {}).get("is_violation"):
        query_parts.append("- Drugs and Magic Remedies Act 1954 prohibition clauses")
        
    rag_query = " ".join(query_parts)
    
    try:
        # Call your existing RAG engine
        rag_response = await rag_engine.process_query(
            rag_query, 
            jurisdiction_mode=JurisdictionMode.INDIA
        )
        state["rag_context"] = rag_response.india_response.content if rag_response.india_response else ""
        logger.info("   ↳ Successfully retrieved grounding context from Vector DB.")
    except Exception as e:
        logger.error(f"RAG Grounding Error: {e}")
        state["rag_context"] = ""
        
    return state

async def check_prior_art_node(state: GraphState):
    import logging
    logger = logging.getLogger("ORCHESTRATOR")
    logger.info("🔍 Searching for Prior Art / Existing Patents...")
    
    plants = state.get("extracted_plants", [])
    claims = state.get("extracted_claims", "")
    
    if plants:
        patents = search_existing_patents(plants, claims)
    else:
        patents = []
        
    return {"prior_art_warnings": patents}
# ---------------------------------------------------------
# 5. COMPILE THE 5-AGENT LANGGRAPH
# ---------------------------------------------------------
workflow = StateGraph(OrchestratorState)

# Add Nodes
workflow.add_node("extract_entities", extract_entities)
workflow.add_node("evaluate_dmr", evaluate_dmr_compliance)
workflow.add_node("query_neo4j", query_neo4j_regulatory)
workflow.add_node("query_supabase", query_supabase_biological)
workflow.add_node("synthesize_report", synthesize_report)
workflow.add_node("query_statutory_rag", query_statutory_rag)

# Linear Graph Execution Flow
workflow.add_edge(START, "extract_entities")
workflow.add_edge("extract_entities", "evaluate_dmr")
workflow.add_edge("evaluate_dmr", "query_neo4j")
workflow.add_edge("query_neo4j", "query_supabase")
workflow.add_edge("query_supabase", "query_statutory_rag")
workflow.add_edge("query_statutory_rag", "synthesize_report")
workflow.add_edge("synthesize_report", END)

# Compiled Runnable Application
app = workflow.compile()