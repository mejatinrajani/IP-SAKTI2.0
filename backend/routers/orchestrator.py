import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, Field
import json
# Import existing core engines
from core.sarvam_client import sarvam_client as bhashini_client
from core.agentic_classifier import agentic_wizard
from core.dpdp_masker import dpdp_masker
from core.dual_rag_engine import rag_engine
from schemas import TranslationRequest, JurisdictionMode, FormulationCategory
from core.graph_engine import graph_db
from core.orchestrator import app as langgraph_app, base_llm
from fastapi import Depends
from core.security import verify_supabase_jwt

router = APIRouter()
logger = logging.getLogger("MASTER_ORCHESTRATOR")

# ---------------------------------------------------------
# SCHEMAS
# ---------------------------------------------------------
class OrchestratorRequest(BaseModel):
    user_input: str = Field(..., description="Raw text from the user")
    user_language: str = Field(default="en", description="ISO language code (e.g., 'en', 'hi')")

class OrchestratorResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[Any] = None

class EvalReportData(BaseModel):
    extracted_plants: List[str] = []
    extracted_claims: str = ""
    dmr_violation: bool = False
    final_report: Dict[str, Any] = {}

class EvalRequest(BaseModel):
    user_prompt: str = Field(..., description="E.g., I am creating an anti-inflammatory formulation using Cannabis sativa and Ziziphus xylopyrus for diabetes cure.")
    user_language: str = Field(default="en", description="ISO language code for Sarvam translation")

class IntentClassification(BaseModel):
    intent: str = Field(
        ..., 
        description="Must be either 'chat' (general conversation/greetings) or 'evaluation' (formulation, botanical names, medical claims, regulatory questions)."
    )
    chat_response: str = Field(
        default="", 
        description="If intent is 'chat', provide a concise, helpful, and polite response. If intent is 'evaluation', leave as empty string."
    )

class EvalResponse(BaseModel):
    type: str = Field(..., description="'chat' or 'evaluation'")
    message: str = Field(..., description="Short conversational summary or chat response")
    report: Optional[EvalReportData] = None

GRAPH_ID_MAP = {
    FormulationCategory.CLASSICAL_GENERIC: "classical_generic",
    FormulationCategory.PATENT_PROPRIETARY: "pnp_medicine",
    FormulationCategory.PHYTOPHARMACEUTICAL: "phytopharmaceutical",
    FormulationCategory.AYURVEDA_AAHAR: "ayurveda_aahar",
    FormulationCategory.COSMETIC: "cosmetic"
}

# ---------------------------------------------------------
# ENDPOINT 1: GENERAL IP/RAG PIPELINE
# ---------------------------------------------------------
@router.post(
    "/ask", 
    response_model=OrchestratorResponse,
    summary="Master Orchestration Pipeline",
    description="End-to-end pipeline: Translation -> Agentic Extraction -> DPDP Masking -> Dual RAG -> Unmasking -> Translation."
)
async def ask_ip_sakti(payload: OrchestratorRequest):
    try:
        current_text = payload.user_input
        
        # --- STEP 1: Translate to English (if needed) ---
        if payload.user_language != "en":
            trans_req = TranslationRequest(
                source_text=current_text, 
                source_lang=payload.user_language, 
                target_lang="en"
            )
            trans_res = await bhashini_client.translate(trans_req)
            current_text = trans_res.translated_text
            
        # --- STEP 2: LangGraph Agentic Extraction ---
        classification = await agentic_wizard.graph.ainvoke({"user_input": current_text})
        if classification.get("clarification_question"):
            return OrchestratorResponse(
                status="clarify", 
                message=classification["clarification_question"]
            )

        # --- STEP 2.5: Neo4j Graph Traversal ---
        final_category = classification["final_classification"].category
        graph_node_id = GRAPH_ID_MAP.get(final_category, "pnp_medicine")
        
        graph_paths = await graph_db.traverse_legal_requirements(graph_node_id)
        
        structured_graph_context = "\n[MANDATORY GRAPH PATHWAYS]: "
        for path in graph_paths:
            structured_graph_context += f"{path['primary_relation']} {path['primary_target']}. "
            if path['secondary_target']:
                structured_graph_context += f"Which then {path['secondary_relation']} {path['secondary_target']}. "
        
        # --- STEP 3: DPDP Trade Secret Masking ---
        safe_query, vault = dpdp_masker.mask_payload(current_text)
        
        enriched_query = f"User Query: {safe_query}\n{structured_graph_context}"
        
        # --- STEP 4: Dual-RAG & Semantic Grader ---
        rag_response = await rag_engine.process_query(enriched_query, jurisdiction_mode=JurisdictionMode.DUAL)
        
        # --- STEP 5: Unmasking ---
        if rag_response.india_response and not rag_response.india_response.is_abstained:
            rag_response.india_response.content = dpdp_masker.unmask_payload(
                rag_response.india_response.content, vault
            )
        
        if rag_response.international_response and not rag_response.international_response.is_abstained:
            rag_response.international_response.content = dpdp_masker.unmask_payload(
                rag_response.international_response.content, vault
            )
            
        # --- STEP 6: Translate Back to Regional Language (if needed) ---
        if payload.user_language != "en":
            if rag_response.india_response:
                out_req_in = TranslationRequest(
                    source_text=rag_response.india_response.content,
                    source_lang="en",
                    target_lang=payload.user_language
                )
                out_res_in = await bhashini_client.translate(out_req_in)
                rag_response.india_response.content = out_res_in.translated_text
                
            if rag_response.international_response:
                out_req_intl = TranslationRequest(
                    source_text=rag_response.international_response.content,
                    source_lang="en",
                    target_lang=payload.user_language
                )
                out_res_intl = await bhashini_client.translate(out_req_intl)
                rag_response.international_response.content = out_res_intl.translated_text

        return OrchestratorResponse(status="success", data=rag_response)

    except Exception as e:
        logger.error(f"Orchestration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Master pipeline execution failed.")

# ---------------------------------------------------------
# ENDPOINT 2: BIOLOGICAL & STATUTORY FORMULATION EVALUATION
# ---------------------------------------------------------
@router.post(
    "/evaluate", 
    response_model=EvalResponse,
    summary="Statutory Formulation Evaluation & Conversational Gatekeeper",
    description="Routes conversational queries instantly or executes the 5-node LangGraph pipeline for statutory evaluation."
)
async def evaluate_formulation(payload: EvalRequest, user_id: str = Depends(verify_supabase_jwt)):
    try:
        current_prompt = payload.user_prompt.strip()
        user_lang = payload.user_language.lower()
        
        # -------------------------------------------------------------------
        # STEP 1: PRE-TRANSLATION (Sarvam / Bhashini)
        # -------------------------------------------------------------------
        if user_lang != "en":
            logger.info(f"🌐 Pre-translating prompt from '{user_lang}' to English...")
            try:
                trans_req = TranslationRequest(
                    source_text=current_prompt,
                    source_lang=user_lang,
                    target_lang="en"
                )
                trans_res = await bhashini_client.translate(trans_req)
                current_prompt = trans_res.translated_text
            except Exception as e:
                logger.warning(f"Translation failed, falling back to original prompt: {e}")

        # -------------------------------------------------------------------
        # STEP 2: FAST INTENT GATEKEEPER ROUTING
        # -------------------------------------------------------------------
        gatekeeper_prompt = (
            "You are the routing classifier for IP-SAKTI 2.0 (Ministry of Ayush Regulatory AI).\n"
            "Analyze the following user input and determine whether it is general conversation or requires a regulatory audit.\n\n"
            f"User Input: \"{current_prompt}\"\n\n"
            "Rules:\n"
            "- If the input is a greeting, general inquiry, pleasantry, or non-formulation chat: "
            "set intent='chat' and craft a polite, professional reply in 'chat_response'.\n"
            "- If the input specifies plant names, Ayurvedic herbs, therapeutic/medical claims, or seeks regulatory/patent assessment: "
            "set intent='evaluation' and leave 'chat_response' empty."
        )

        structured_router = base_llm.with_structured_output(IntentClassification)
        route_decision: IntentClassification = await structured_router.ainvoke(gatekeeper_prompt)

        # -------------------------------------------------------------------
        # PATH A: CONVERSATIONAL CHAT (Bypasses Heavy Pipeline)
        # -------------------------------------------------------------------
        if route_decision.intent == "chat":
            chat_reply = route_decision.chat_response
            
            # Post-translate chat response if needed
            if user_lang != "en" and chat_reply:
                try:
                    out_req = TranslationRequest(
                        source_text=chat_reply,
                        source_lang="en",
                        target_lang=user_lang
                    )
                    out_res = await bhashini_client.translate(out_req)
                    chat_reply = out_res.translated_text
                except Exception as e:
                    logger.warning(f"Chat post-translation failed: {e}")

            return EvalResponse(
                type="chat",
                message=chat_reply or "Hello! I am ready to evaluate your Ayurvedic formulation. Please share your ingredients and intended claims.",
                report=None
            )

        # -------------------------------------------------------------------
        # PATH B: STATUTORY EVALUATION (Executes 5-Node LangGraph Pipeline)
        # -------------------------------------------------------------------
        logger.info(f"⚖️ Gatekeeper routed to Evaluation Pipeline. Processing: '{current_prompt}'")
        
        initial_state = {
            "user_prompt": current_prompt,
            "user_language": user_lang
        }
        
        # Asynchronously invoke LangGraph engine
        result = await langgraph_app.ainvoke(initial_state)
        
        dmr_data = result.get("dmr_evaluation", {})
        final_report_content = result.get("final_report", {}).get("content", "")
        extracted_plants = result.get("extracted_plants", [])
        extracted_claims = result.get("extracted_claims", "")

        # -------------------------------------------------------------------
        # STEP 3: POST-TRANSLATION OF DOSSIER (If non-English)
        # -------------------------------------------------------------------
        if user_lang != "en" and final_report_content:
            logger.info(f"🌐 Post-translating dossier from English to '{user_lang}'...")
            try:
                out_req = TranslationRequest(
                    source_text=final_report_content,
                    source_lang="en",
                    target_lang=user_lang
                )
                out_res = await bhashini_client.translate(out_req)
                final_report_content = out_res.translated_text
            except Exception as e:
                logger.warning(f"Dossier post-translation failed: {e}")

        final_report = result.get("final_report", {})
        final_report["content"] = final_report_content

        summary_msg = (
            f"Evaluation complete. Extracted {len(extracted_plants)} botanical entities and cross-referenced "
            f"statutory pathways across the DMR Act (1954), Schedule E(1), and the Biological Diversity Act (2002)."
        )
        
        # Translate conversational message if requested
        if user_lang != "en":
            try:
                msg_req = TranslationRequest(source_text=summary_msg, source_lang="en", target_lang=user_lang)
                msg_res = await bhashini_client.translate(msg_req)
                summary_msg = msg_res.translated_text
            except Exception as e:
                logger.warning(f"Summary message translation failed: {e}")

        return EvalResponse(
            type="evaluation",
            message=summary_msg,
            report=EvalReportData(
                extracted_plants=extracted_plants,
                extracted_claims=extracted_claims,
                dmr_violation=dmr_data.get("is_violation", False),
                final_report=final_report
            )
        )

    except Exception as e:
        logger.error(f"Formulation evaluation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Evaluation pipeline failed: {str(e)}")