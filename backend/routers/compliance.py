import logging
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from core.abs_calculator import abs_calculator

logger = logging.getLogger("COMPLIANCE_ROUTER")
router = APIRouter()

# 1. Define Schemas right here to prevent stale imports
class ABSRequest(BaseModel):
    applicant_type: str = "commercial_entity"
    purpose: str = "commercial_utilization"
    gross_annual_sales_inr: float = 0.0
    upfront_licensing_fee_inr: float = 0.0
    annual_royalty_inr: float = 0.0

class ABSResponse(BaseModel):
    is_exempt: bool = False
    exemption_reason: Optional[str] = None
    calculated_abs_fee_inr: float = 0.0
    calculated_max_fee_inr: float = 0.0    
    applied_rate_description: str = ""
    statutory_reality_check: List[str] = []

# 2. Force Body(...) parsing
@router.post(
    "/calculate-abs", 
    response_model=ABSResponse,
    summary="Statutory ABS Fee Calculator"
)
async def calculate_abs_fee(payload: ABSRequest = Body(...)):
    try:
        logger.info(f"Received ABS Request: {payload.dict()}")
        
        # Pass the payload directly to the calculator logic
        response_data = abs_calculator.calculate(payload)
        
        return response_data
    except Exception as e:
        logger.error(f"ABS Calculation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ABS Calculation failed: {str(e)}")