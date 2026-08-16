import chromadb
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class RAGCore:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.chroma_client.get_or_create_collection(name="ingres_groundwater")
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        # model.encode returns a numpy array, we need a list of lists of floats for chroma
        embeddings = self.model.encode(texts)
        return embeddings.tolist()

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Expects chunks format:
        [
            {
                "id": "chunk_1",
                "text": "The groundwater is safe...",
                "metadata": {"document_id": "...", "page": 1, "source": "CGWB", ...}
            }, ...
        ]
        """
        if not chunks:
            return

        texts = [c["text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        ids = [c["id"] for c in chunks]

        embeddings = self.embed_texts(texts)

        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"Added {len(chunks)} chunks to ChromaDB.")

    def search(self, query: str, top_k: int = 5, metadata_filter: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        query_embedding = self.embed_texts([query])[0]
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=metadata_filter
        )
        
        matches = []
        if results['documents'] and len(results['documents']) > 0:
            docs = results['documents'][0]
            metas = results['metadatas'][0]
            dists = results['distances'][0]
            
            for doc, meta, dist in zip(docs, metas, dists):
                matches.append({
                    "text": doc,
                    "metadata": meta,
                    "score": dist
                })
        
        return matches

rag_core = RAGCore()
