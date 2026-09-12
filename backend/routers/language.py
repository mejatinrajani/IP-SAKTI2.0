import logging
from fastapi import APIRouter, HTTPException, status
from schemas import TranslationRequest, TranslationResponse
from core.bhashini_client import bhashini_client

router = APIRouter()
logger = logging.getLogger("ROUTER_LANGUAGE")

@router.post(
    "/translate",
    response_model=TranslationResponse,
    summary="Bhashini Legal Translation",
    description="Translates legal text utilizing the MeitY Bhashini ULCA NMT pipeline."
)
async def translate_text(request: TranslationRequest):
    try:
        response = await bhashini_client.translate(request)
        return response
    except Exception as e:
        logger.error(f"Translation endpoint failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to communicate with Bhashini ULCA Pipeline."
        )