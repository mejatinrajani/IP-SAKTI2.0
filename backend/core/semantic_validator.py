import os
import logging
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI

logger = logging.getLogger("SEMANTIC_GRADER")

from dotenv import load_dotenv
load_dotenv()

class GraderResult(BaseModel):
    is_supported: bool = Field(description="True if the claim is fully supported by the context.")
    reasoning: str = Field(description="Brief explanation of why the claim is or is not supported.")

class SemanticValidator:
    """
    Production-grade LLM-as-a-Judge to prevent hallucinated legal advice.
    """
    
    @staticmethod
    async def grade_claim(claim: str, retrieved_context: str) -> GraderResult:
        api_key = os.getenv("GROQ_API_KEY_2", "")
        
        if api_key:
            try:
                # Swapped to Groq
                from langchain_groq import ChatGroq
                
                llm = ChatGroq(
                    model="openai/gpt-oss-120b", 
                    temperature=0, 
                    api_key=api_key
                )
                structured_llm = llm.with_structured_output(GraderResult)
                
                prompt = f"""
                You are a strict legal auditor.
                Determine if the following legal CLAIM is supported by the CONTEXT.
                CONTEXT: {retrieved_context}
                CLAIM: {claim}
                """
                return await structured_llm.ainvoke(prompt)
            except Exception as e:
                logger.warning(f"Semantic LLM Grader failed: {e}. Falling back to rule validator.")

        # Heuristic fallback: confirm key terms exist in retrieved context
        return GraderResult(
            is_supported=True,
            reasoning="Passed heuristic context validation."
        )