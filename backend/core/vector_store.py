import os
import time
import logging
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

# Configure logging
logger = logging.getLogger("VECTOR_STORE")

# ==========================================
# 1. BULLETPROOF ENVIRONMENT LOADING
# ==========================================
# Compute absolute paths regardless of where uvicorn is executed
CURRENT_DIR = Path(__file__).resolve().parent          # backend/core/
BACKEND_DIR = CURRENT_DIR.parent                      # backend/
PROJECT_ROOT = BACKEND_DIR.parent                     # project root /

env_file_backend = BACKEND_DIR / ".env"
env_file_root = PROJECT_ROOT / ".env"

if env_file_backend.exists():
    load_dotenv(dotenv_path=env_file_backend, override=True)
elif env_file_root.exists():
    load_dotenv(dotenv_path=env_file_root, override=True)
else:
    load_dotenv(override=True)  # Fallback for Render environment variables

# ==========================================
# 2. VECTOR DATABASE CONFIGURATION
# ==========================================
DB_DIR = str(BACKEND_DIR / "data" / "chroma_db")


class LegalVectorStore:
    def __init__(self):
        # Ensure the data directory exists
        os.makedirs(DB_DIR, exist_ok=True)
        
        self.client = chromadb.PersistentClient(path=DB_DIR)

        # 🚀 Fetch Hugging Face API key robustly (Checks both common variable names)
        hf_token = os.getenv("HF_API_TOKEN") or os.getenv("CHROMA_HUGGINGFACE_API_KEY")
        
        if not hf_token:
            logger.error("Missing HF_API_TOKEN or CHROMA_HUGGINGFACE_API_KEY! RAG will fail.")
            # Set to empty string to prevent Chroma from throwing a fatal ValueError on boot
            hf_token = ""

        # Offload the heavy model to Hugging Face's free cloud API
        try:
            self.embedding_fn = embedding_functions.HuggingFaceEmbeddingFunction(
                api_key=hf_token,
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
        except Exception as e:
            logger.error(f"Failed to initialize HuggingFaceEmbeddingFunction: {e}")
            self.embedding_fn = None

        # 1. Indian Statutory Corpus Collection
        self.india_collection = self.client.get_or_create_collection(
            name="india_statutes",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

        # 2. International Treaties & IP Corpus Collection
        self.intl_collection = self.client.get_or_create_collection(
            name="international_treaties",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

    def query(self, query_text: str, namespace: str = "india", n_results: int = 4) -> List[Dict[str, Any]]:
        """
        Executes semantic vector search against the isolated jurisdictional collection.
        Includes built-in retry logic to survive Render Free Tier DNS drops.
        """
        if not self.embedding_fn:
            logger.error("Embedding function is offline. Cannot query vector store.")
            return []

        collection = self.india_collection if namespace == "india" else self.intl_collection
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                results = collection.query(
                    query_texts=[query_text],
                    n_results=n_results
                )

                retrieved_chunks = []
                
                # Safely parse results
                if results and results.get("documents") and len(results["documents"]) > 0:
                    documents = results["documents"][0]
                    metadatas = results.get("metadatas", [[]])[0]
                    
                    # Ensure metadata matches document length to prevent zip failures
                    if not metadatas:
                        metadatas = [{}] * len(documents)

                    for doc, meta in zip(documents, metadatas):
                        retrieved_chunks.append({
                            "text": doc,
                            "statute": meta.get("statute", "Unknown"),
                            "section": meta.get("section", "General"),
                            "jurisdiction": meta.get("jurisdiction", namespace)
                        })
                
                # Return successfully parsed chunks
                return retrieved_chunks
                
            except Exception as e:
                logger.warning(f"Vector search attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"Final vector search failure for namespace '{namespace}': {e}")
                    return []
                
                # Wait before retrying (Exponential backoff for DNS recovery)
                time.sleep(1.5 * (attempt + 1))

# Initialize a singleton instance to be used across the application
vector_store = LegalVectorStore()