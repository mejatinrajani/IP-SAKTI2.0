import os
import logging
from neo4j import AsyncGraphDatabase
from typing import List, Dict, Any
from dotenv import load_dotenv

logger = logging.getLogger("GRAPH_ENGINE")

class KnowledgeGraphEngine:
    """
    Asynchronous Neo4j driver handling multi-hop legal traversals.
    """
    def __init__(self):
        # Load variables from .env
        load_dotenv()

        self.uri = os.environ.get("NEO4J_URI", "")
        self.user = os.environ.get("NEO4J_USERNAME") or os.environ.get("NEO4J_USER", "neo4j")
        self.password = os.environ.get("NEO4J_PASSWORD", "")
        self.database = os.environ.get("NEO4J_DATABASE", "neo4j")

        self.driver = AsyncGraphDatabase.driver(
            self.uri,
            auth=(self.user, self.password)
        )

    async def close(self):
        await self.driver.close()

    async def traverse_legal_requirements(self, formulation_id: str) -> List[Dict[str, Any]]:
        """
        Executes a 2-hop traversal to find all statutory bars and required approvals 
        linked to a specific formulation category.
        """
        query = """
        MATCH (f:Formulation {id: $formulation_id})-[r1]->(node1)
        OPTIONAL MATCH (node1)-[r2]->(node2)
        RETURN 
            type(r1) AS primary_relation, 
            node1.name AS primary_target,
            type(r2) AS secondary_relation,
            node2.name AS secondary_target
        """

        results = []
        try:
            async with self.driver.session(database=self.database) as session:
                record_res = await session.run(query, formulation_id=formulation_id)
                records = await record_res.data()
                for record in records:
                    results.append(record)
            return results
        except Exception as e:
            logger.error(f"Graph traversal failed: {str(e)}")
            return []

# Singleton instantiation
graph_db = KnowledgeGraphEngine()
