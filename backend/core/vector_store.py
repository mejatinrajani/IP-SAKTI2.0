import os
import time
import logging
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
import requests
import chromadb
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings

logger = logging.getLogger("VECTOR_STORE")

# Load environment variables path-agnostically
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

env_file_backend = BACKEND_DIR / ".env"
env_file_root = PROJECT_ROOT / ".env"

if env_file_backend.exists():
    load_dotenv(dotenv_path=env_file_backend, override=True)
elif env_file_root.exists():
    load_dotenv(dotenv_path=env_file_root, override=True)
else:
    load_dotenv(override=True)

DB_DIR = str(BACKEND_DIR / "data" / "chroma_db")


class CustomHuggingFaceEmbeddingFunction(EmbeddingFunction):
    """
    Custom HTTP embedding function targeting Hugging Face's Inference API directly.
    Bypasses standard library restrictions and forces robust session handling.
    """
    def __init__(self, api_key: str, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.api_key = api_key
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_name}"
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def __call__(self, input: Documents) -> Embeddings:
        payload = {
            "inputs": input,
            "options": {"wait_for_model": True}
        }
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.session.post(self.api_url, json=payload, timeout=30)
                
                # Handle HF model loading state (status 503)
                if response.status_code == 503:
                    logger.warning("HF model is loading into memory, retrying in 3 seconds...")
                    time.sleep(3)
                    continue
                    
                response.raise_for_status()
                result = response.json()
                
                # Validate response structure
                if isinstance(result, list):
                    return result
                elif isinstance(result, dict) and "error" in result:
                    raise Exception(f"HF API returned error: {result['error']}")
                
                return result
                
            except Exception as e:
                logger.warning(f"Custom embedding HTTP attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error("All Hugging Face custom embedding requests failed.")
                    raise e
                time.sleep(2)
        return []


class LegalVectorStore:
    def __init__(self):
        os.makedirs(DB_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=DB_DIR)

        hf_token = os.getenv("HF_API_TOKEN") or os.getenv("CHROMA_HUGGINGFACE_API_KEY")
        if not hf_token:
            logger.error("Missing HF_API_TOKEN! Embeddings will fail.")
            hf_token = ""

        # Use the custom HTTP embedding class
        self.embedding_fn = CustomHuggingFaceEmbeddingFunction(
            api_key=hf_token,
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        self.india_collection = self.client.get_or_create_collection(
            name="india_statutes",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

        self.intl_collection = self.client.get_or_create_collection(
            name="international_treaties",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

    def query(self, query_text: str, namespace: str = "india", n_results: int = 4) -> List[Dict[str, Any]]:
        collection = self.india_collection if namespace == "india" else self.intl_collection
        
        try:
            results = collection.query(
                query_texts=[query_text],
                n_results=n_results
            )

            retrieved_chunks = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                documents = results["documents"][0]
                metadatas = results.get("metadatas", [[]])[0]
                if not metadatas:
                    metadatas = [{}] * len(documents)

                for doc, meta in zip(documents, metadatas):
                    retrieved_chunks.append({
                        "text": doc,
                        "statute": meta.get("statute", "Unknown"),
                        "section": meta.get("section", "General"),
                        "jurisdiction": meta.get("jurisdiction", namespace)
                    })
            return retrieved_chunks
        except Exception as e:
            logger.error(f"Vector search failed for namespace '{namespace}': {e}")
            return []

vector_store = LegalVectorStore()