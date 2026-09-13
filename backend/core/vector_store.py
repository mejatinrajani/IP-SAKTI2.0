import os
import logging
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
import chromadb
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings
from fastembed import TextEmbedding

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


class CustomFastEmbedFunction(EmbeddingFunction):
    """
    Custom wrapper to run FastEmbed locally via ONNX and feed it into ChromaDB.
    """
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        self.model = TextEmbedding(model_name=model_name)

    def __call__(self, input: Documents) -> Embeddings:
        # FastEmbed returns a generator of numpy arrays.
        # ChromaDB requires a Python list of lists.
        embeddings = list(self.model.embed(input))
        return [emb.tolist() for emb in embeddings]


class LegalVectorStore:
    def __init__(self):
        os.makedirs(DB_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=DB_DIR)

        # 🚀 Initialize our custom FastEmbed wrapper
        self.embedding_fn = CustomFastEmbedFunction(
            model_name="BAAI/bge-small-en-v1.5"
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