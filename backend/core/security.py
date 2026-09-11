import os
import jwt
import logging
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("SECURITY")

SUPABASE_URL = os.getenv("SUPABASE_URL") 
if not SUPABASE_URL:
    logger.error("SUPABASE_URL is missing from backend environment variables!")

# Supabase Auth JWKS endpoint for asymmetric JWT verification
jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(jwks_url)

security = HTTPBearer()

def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Server configuration error: SUPABASE_URL missing.")

    try:
        # 1. Fetch the correct asymmetric public key from Supabase
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # 2. Decode using the fetched public key
        payload = jwt.decode(
            token, 
            signing_key.key, 
            algorithms=["ES256", "RS256", "HS256"], 
            options={"verify_aud": False}
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token missing subject (user_id).")
            
        return user_id
        
    except jwt.PyJWKClientError as e:
        logger.error(f"JWKS Key Fetch Failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Unable to verify token signature with Supabase.")
    except jwt.ExpiredSignatureError:
        logger.warning("Expired Supabase token rejected.")
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except Exception as e:
        logger.error(f"JWT Verification Failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")