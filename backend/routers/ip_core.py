import logging
from fastapi import APIRouter, HTTPException, status
from schemas import (
    WizardStepInput, 
    ClassificationResult, 
    RAGQueryRequest, 
    DualRAGResponse
)
from core.classifier_wizard import FormulationClassifierWizard
from core.dual_rag_engine import rag_engine
from core.dpdp_masker import dpdp_masker
from fastapi import Body
from core.agentic_classifier import agentic_wizard

router = APIRouter()
logger = logging.getLogger("ROUTER_IP_CORE")

@router.post(
    "/agentic-classify",
    summary="Agentic Formulation Gatekeeper",
    description="Uses LangGraph to dynamically extract formulation parameters from conversational text."
)
async def classify_ayurvedic_product_agentic(user_input: str = Body(..., embed=True)):
    try:
        # Initialize the graph state with the user's raw text
        initial_state = {"user_input": user_input}
        
        # Execute the LangGraph workflow
        result = await agentic_wizard.graph.ainvoke(initial_state)
        
        # If the graph routed to 'ask_user', return the clarifying question
        if result.get("clarification_question"):
            return {
                "status": "pending_clarification",
                "message": result["clarification_question"]
            }
            
        # If the graph successfully classified the product, return the legal payload
        return {
            "status": "classified",
            "data": result["final_classification"]
        }
    except Exception as e:
        logger.error(f"Agentic classification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Workflow execution failed.")

@router.post("/query-dual-rag", response_model=DualRAGResponse)
async def query_legal_rag(payload: RAGQueryRequest):
    try:
        # 1. MASK: Intercept and scrub the trade secrets
        safe_query, secret_vault = dpdp_masker.mask_payload(payload.query)
        logger.info(f"Masked Query: {safe_query}")
        
        # 2. PROCESS: Send the safe query to your RAG engine
        response = await rag_engine.process_query(
            query=safe_query,
            jurisdiction_mode=payload.jurisdiction
        )
        
        # 3. UNMASK: Restore the trade secrets in the final outputs
        if not response.india_response.is_abstained:
            response.india_response.content = dpdp_masker.unmask_payload(
                response.india_response.content, secret_vault
            )
            
        if response.international_response and not response.international_response.is_abstained:
            response.international_response.content = dpdp_masker.unmask_payload(
                response.international_response.content, secret_vault
            )
            
        # Restore the original query in the response payload
        response.query = payload.query 
        return response
    except Exception as e:
        logger.error(f"RAG query failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing verified legal query."
        )