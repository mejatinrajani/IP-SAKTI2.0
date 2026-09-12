import os
import httpx
import asyncio
import logging
from typing import List
from dotenv import load_dotenv
from schemas import TranslationRequest

load_dotenv()
logger = logging.getLogger("BHASHINI_CLIENT")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class BhashiniTranslationClient:
    def __init__(self):
        # Load keys from the Bhashini Dashboard
        self.udyat_key = os.getenv("BHASHINI_UDYAT_KEY")
        self.inference_key = os.getenv("BHASHINI_INFERENCE_KEY")
        
        # Bhashini Dhruva Inference Pipeline Endpoint
        self.inference_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        
        # Bhashini natively supports all 22 Scheduled Indian Languages 
        self.supported_languages = {
            "en": "en", "hi": "hi", "bn": "bn", "gu": "gu", "kn": "kn",
            "ml": "ml", "mr": "mr", "or": "or", "pa": "pa", "ta": "ta",
            "te": "te", "as": "as", "ur": "ur", "sa": "sa", "mai": "mai",
            "brx": "brx", "doi": "doi", "ks": "ks", "gom": "gom", "mni": "mni",
            "ne": "ne", "sat": "sat", "sd": "sd"
        }

    async def _call_bhashini_api(self, text: str, source_lang: str, target_lang: str) -> str:
        """Executes the HTTP POST to the Bhashini ULCA NMT Pipeline."""
        headers = {
            "Content-Type": "application/json",
            # The API requires the Inference Key passed in the Authorization header
            "Authorization": self.inference_key, 
            "Accept": "*/*"
        }
        
        # Standard Bhashini Translation (NMT) Payload
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang
                        },
                        # Standard service ID for text-to-text Indic translation
                        "serviceId": "ai4bharat/indictrans-v2-all-gpu--t4" 
                    }
                }
            ],
            "inputData": {
                "input": [
                    {
                        "source": text
                    }
                ]
            }
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(self.inference_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Extract the translated text from the nested Bhashini JSON response
            try:
                translated = data["pipelineResponse"][0]["output"][0]["target"]
                return translated
            except (KeyError, IndexError):
                logger.error(f"Failed to parse Bhashini response: {data}")
                return text

    async def translate(self, request: TranslationRequest):
        """Mirrors the Sarvam interface so the FastAPI router doesn't break."""
        if request.source_lang == request.target_lang:
            class MockResponse:
                def __init__(self, translated_text):
                    self.translated_text = translated_text
            return MockResponse(request.source_text)

        logger.info(f"🇮🇳 BHASHINI: Translating [{request.source_lang}] -> [{request.target_lang}]")
        
        try:
            # Call Bhashini API
            translated_text = await self._call_bhashini_api(
                request.source_text, 
                request.source_lang, 
                request.target_lang
            )
            
            # Wrap response to match your Pydantic TranslationResponse schema
            class TranslationResponseMock:
                def __init__(self, translated_text):
                    self.translated_text = translated_text
            
            return TranslationResponseMock(translated_text=translated_text)
            
        except Exception as e:
            logger.error(f"Bhashini API failed: {e}")
            # Fallback returns original text if the API drops
            class TranslationResponseMock:
                def __init__(self, translated_text):
                    self.translated_text = translated_text
            return TranslationResponseMock(translated_text=request.source_text)

# Singleton instance to be imported by the router
bhashini_client = BhashiniTranslationClient()