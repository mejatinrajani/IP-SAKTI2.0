import logging
from typing import TypedDict, Annotated, Optional, Literal
from pydantic import BaseModel, Field
import os
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from schemas import FormulationCategory, ClassificationResult

logger = logging.getLogger("AGENTIC_CLASSIFIER")

from dotenv import load_dotenv
load_dotenv()

# 1. Define the Graph State
class AgentState(TypedDict):
    user_input: str
    is_classical: Optional[bool]
    contains_purified_extract: Optional[bool]
    intended_use: Optional[Literal["internal_therapeutic", "food_supplement", "topical_cleansing"]]
    uses_indian_bio_resource: Optional[bool]
    clarification_question: Optional[str]
    final_classification: Optional[ClassificationResult]

# 2. Pydantic Model for LLM Tool Extraction
class ExtractionTool(BaseModel):
    is_classical: Optional[bool] = Field(description="True if exact ancient text recipe, False if modified/new.")
    contains_purified_extract: Optional[bool] = Field(description="True if using chemical solvents/purified extracts.")
    intended_use: Optional[str] = Field(description="Must be 'internal_therapeutic', 'food_supplement', or 'topical_cleansing'.")
    uses_indian_bio_resource: Optional[bool] = Field(description="True if plants are sourced from India.")

class AgenticWizard:
    def __init__(self):
        # We use a fast model for extraction
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.llm = None
        self.extractor_llm = None

        if self.api_key:
            try:
                # Swapped to Groq
                from langchain_groq import ChatGroq
                
                # Using the 70b versatile model
                self.llm = ChatGroq(
                    model="openai/gpt-oss-120b", 
                    temperature=0, 
                    api_key=self.api_key
                )
                self.extractor_llm = self.llm.with_structured_output(ExtractionTool)
            except Exception as e:
                logger.warning(f"Failed to initialize ChatGroq: {e}. Falling back to heuristic mode.")
        
        # Build the Graph
        builder = StateGraph(AgentState)
        builder.add_node("extract_variables", self.extract_variables)
        builder.add_node("ask_user", self.ask_user)
        builder.add_node("classify_statute", self.classify_statute)
        
        builder.set_entry_point("extract_variables")
        
        # Conditional Routing
        builder.add_conditional_edges(
            "extract_variables",
            self.route_next_step,
            {
                "clarify": "ask_user",
                "classify": "classify_statute"
            }
        )
        
        builder.add_edge("ask_user", END)
        builder.add_edge("classify_statute", END)
        
        self.graph = builder.compile()

    # --- NODE: Extraction ---
    async def extract_variables(self, state: AgentState):
        """Extracts variables from the user's raw conversational input."""
        # Highly concise prompt to optimize model performance
        prompt = f"""
        Extract Ayurvedic formulation properties from the text.
        Text: {state['user_input']}
        """
        
        try:
            extracted = await self.extractor_llm.ainvoke(prompt)
            return {
                "is_classical": extracted.is_classical if state.get("is_classical") is None else state["is_classical"],
                "contains_purified_extract": extracted.contains_purified_extract if state.get("contains_purified_extract") is None else state["contains_purified_extract"],
                "intended_use": extracted.intended_use if state.get("intended_use") is None else state["intended_use"],
                "uses_indian_bio_resource": extracted.uses_indian_bio_resource if state.get("uses_indian_bio_resource") is None else state["uses_indian_bio_resource"],
            }
        except Exception as e:
            logger.error(f"Extraction failed: {e}")
            return state

    # --- ROUTER: Conditional Edge ---
    def route_next_step(self, state: AgentState) -> str:
        """Determines if we have enough info to classify, or if we must ask the user."""
        if state.get("intended_use") is None or state.get("is_classical") is None:
            return "clarify"
        return "classify"

    # --- NODE: Clarification ---
    async def ask_user(self, state: AgentState):
        """Generates a dynamic question if variables are missing."""
        missing = []
        if state.get("intended_use") is None: missing.append("intended use (food, cosmetic, or medicine)")
        if state.get("is_classical") is None: missing.append("if the recipe is modified from classical texts")
        
        question = f"To determine the correct IP and regulatory pathway, could you clarify: {', '.join(missing)}?"
        return {"clarification_question": question}

    # --- NODE: Statutory Classification ---
    async def classify_statute(self, state: AgentState):
        """Maps the fully extracted state to the exact legal framework."""
        # This mirrors your previous deterministic logic, but now it's fed autonomously
        category = FormulationCategory.PATENT_PROPRIETARY
        act = "Drugs and Cosmetics Act, 1940"
        
        if state.get("is_classical"):
            category = FormulationCategory.CLASSICAL_GENERIC
        elif state.get("intended_use") == "topical_cleansing":
            category = FormulationCategory.COSMETIC
        elif state.get("intended_use") == "food_supplement":
            category = FormulationCategory.AYURVEDA_AAHAR
        elif state.get("contains_purified_extract"):
            category = FormulationCategory.PHYTOPHARMACEUTICAL

        result = ClassificationResult(
            category=category,
            regulatory_act=act,
            licensing_form="Dynamic Form",
            patentability_verdict="Determined by Graph",
            statutory_bars=[],
            abs_applicable=state.get("uses_indian_bio_resource", True),
            recommended_ip=[]
        )
        return {"final_classification": result}

# Singleton Instance
agentic_wizard = AgenticWizard()