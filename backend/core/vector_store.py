import os
import logging
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

logger = logging.getLogger("VECTOR_STORE")

# Persist the vector database locally inside backend/data/chroma_db
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chroma_db")

class LegalVectorStore:
    def __init__(self):
        os.makedirs(DB_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=DB_DIR)
        
        # Fast, dense local embedding model
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
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
        """
        collection = self.india_collection if namespace == "india" else self.intl_collection
        
        try:
            results = collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            
            retrieved_chunks = []
            if results and results["documents"]:
                for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
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