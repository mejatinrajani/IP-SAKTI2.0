import os
import logging
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("AUTH_ROUTER")

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class SignUpRequest(BaseModel):
    email: str
    password: str

@router.post("/signup", summary="Backend assisted signup")
async def signup(payload: SignUpRequest = Body(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection uninitialized.")

    try:
        res = supabase.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True
        })
        # If response has a user object
        user_id = res.user.id if res and hasattr(res, 'user') else None
        return {"status": "success", "user_id": user_id}
    except Exception as e:
        logger.error(f"Signup failed: {str(e)}")
        error_msg = str(e).lower()
        if "already exists" in error_msg or "duplicate" in error_msg or "already registered" in error_msg:
            raise HTTPException(status_code=409, detail="User already exists")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")
