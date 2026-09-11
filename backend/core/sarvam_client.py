import os
import re
import httpx
import asyncio
import logging
from typing import List
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from schemas import TranslationRequest

load_dotenv()
logger = logging.getLogger("SARVAM_CLIENT")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class SarvamTranslationClient:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY")
        self.base_url = "https://api.sarvam.ai/translate"
        
        # Safe character limit per chunk
        self.char_limit = 1000 
        
        # Sarvam explicitly supported ISO language mappings (requires the -IN suffix)
        self.sarvam_supported = {
            "en": "en-IN", "hi": "hi-IN", "bn": "bn-IN", "kn": "kn-IN", 
            "ml": "ml-IN", "mr": "mr-IN", "or": "or-IN", "pa": "pa-IN", 
            "ta": "ta-IN", "te": "te-IN", "gu": "gu-IN"
        }

        # Full 22 Scheduled Indian Languages mapping for the LLM Fallback
        self.all_languages = {
            "en": "English", "as": "Assamese", "bn": "Bengali", "brx": "Bodo", 
            "doi": "Dogri", "gu": "Gujarati", "hi": "Hindi", "kn": "Kannada", 
            "ks": "Kashmiri", "gom": "Konkani", "mai": "Maithili", "ml": "Malayalam", 
            "mni": "Manipuri", "mr": "Marathi", "ne": "Nepali", "or": "Odia", 
            "pa": "Punjabi", "sa": "Sanskrit", "sat": "Santali", "sd": "Sindhi", 
            "ta": "Tamil", "te": "Telugu", "ur": "Urdu"
        }

        # Fallback LLM (Groq) for unsupported languages or if Sarvam goes down
        groq_api = os.getenv("GROQ_API_KEY")
        self.fallback_llm = ChatGroq(model="mixtral-8x7b-32768", api_key=groq_api, temperature=0.1) if groq_api else None

    def _chunk_text(self, text: str) -> List[str]:
        """Intelligently chunks long text by paragraphs to respect API limits."""
        paragraphs = re.split(r'\n\n+', text.strip())
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 < self.char_limit:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                if len(para) >= self.char_limit:
                    sentences = re.split(r'(?<=[.!?]) +', para)
                    temp_chunk = ""
                    for sentence in sentences:
                        if len(temp_chunk) + len(sentence) < self.char_limit:
                            temp_chunk += sentence + " "
                        else:
                            chunks.append(temp_chunk.strip())
                            temp_chunk = sentence + " "
                    current_chunk = temp_chunk
                else:
                    current_chunk = para + "\n\n"
                    
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks

    async def _call_sarvam_api(self, chunk: str, source_lang: str, target_lang: str) -> str:
        """Executes the HTTP POST to Sarvam AI Translation API."""
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": self.api_key
        }
        
        payload = {
            "input": chunk,
            "source_language_code": self.sarvam_supported[source_lang],
            "target_language_code": self.sarvam_supported[target_lang],
            "speaker_gender": "Male",
            "mode": "formal"
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(self.base_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("translated_text", chunk)

    async def _fallback_translation(self, text: str, source_lang: str, target_lang: str) -> str:
        """LLM Fallback for languages not covered by Sarvam (e.g., Assamese) or during API failures."""
        if not self.fallback_llm:
            logger.warning("No fallback LLM available. Returning original text.")
            return text

        source_name = self.all_languages.get(source_lang, source_lang)
        target_name = self.all_languages.get(target_lang, target_lang)
        
        sys_msg = SystemMessage(content=f"You are a highly accurate legal translator for the Ministry of Ayush. Translate the following text from {source_name} to {target_name}. Preserve all formatting exactly as it appears (e.g., Markdown tables, asterisks for bolding). Do not add conversational filler.")
        human_msg = HumanMessage(content=text)
        
        try:
            response = await self.fallback_llm.ainvoke([sys_msg, human_msg])
            return response.content
        except Exception as e:
            logger.error(f"Fallback translation failed: {e}")
            return text

    async def translate(self, request: TranslationRequest):
        """Chunks the text -> translates sequentially -> stitches and returns."""
        if request.source_lang == request.target_lang:
            return TranslationRequest(source_text=request.source_text, source_lang=request.source_lang, target_lang=request.target_lang, translated_text=request.source_text)

        logger.info(f"🌐 Translating [{request.source_lang}] -> [{request.target_lang}]")
        
        chunks = self._chunk_text(request.source_text)
        translated_chunks = []
        
        # Determine if we can use Sarvam or must route directly to LLM
        sarvam_compatible = (
            request.source_lang in self.sarvam_supported and 
            request.target_lang in self.sarvam_supported and 
            bool(self.api_key)
        )
        
        for i, chunk in enumerate(chunks):
            logger.info(f"   ↳ Processing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")
            try:
                if sarvam_compatible:
                    trans_chunk = await self._call_sarvam_api(chunk, request.source_lang, request.target_lang)
                    translated_chunks.append(trans_chunk)
                    await asyncio.sleep(0.3) # Gentle rate limit
                else:
                    if not self.api_key:
                        logger.warning(f"   ⚠️ Sarvam API key missing. Routing chunk {i+1} to Groq LLM Fallback...")
                    else:
                        logger.info(f"   ⚠️ Language not supported by Sarvam natively. Routing chunk {i+1} to Groq LLM Fallback...")
                    trans_chunk = await self._fallback_translation(chunk, request.source_lang, request.target_lang)
                    translated_chunks.append(trans_chunk)
                    
            except Exception as e:
                logger.warning(f"   ⚠️ Sarvam API failed for chunk {i+1} ({e}). Rerouting to Groq LLM Fallback...")
                trans_chunk = await self._fallback_translation(chunk, request.source_lang, request.target_lang)
                translated_chunks.append(trans_chunk)

        final_translated_text = "\n\n".join(translated_chunks)
        
        class TranslationResponseMock:
            def __init__(self, translated_text):
                self.translated_text = translated_text
                
        return TranslationResponseMock(translated_text=final_translated_text)

# Singleton instance to be imported by the routers
sarvam_client = SarvamTranslationClient()