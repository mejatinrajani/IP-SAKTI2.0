import os
import sys
import logging
from typing import List
from dotenv import load_dotenv
from neo4j import GraphDatabase
from supabase import create_client, Client

load_dotenv()
logger = logging.getLogger("NEO4J_SEEDER")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# ---------------------------------------------------------
# CREDENTIALS & CONNECTIONS
# ---------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "sih2026")

if not all([SUPABASE_URL, SUPABASE_KEY, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD]):
    logger.error("❌ Missing Supabase or Neo4j environment variables.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# ---------------------------------------------------------
# REAL INDIAN STATUTORY DATA (Drugs & Cosmetics Act, 1940)
# Schedule E(1) - List of Poisonous Ayurvedic/Siddha Substances
# ---------------------------------------------------------
SCHEDULE_E1_BOTANICALS = {
    "Aconitum ferox", "Aconitum chasmanthum", "Abrus precatorius",
    "Cannabis sativa", "Datura metel", "Datura stramonium",
    "Strychnos nux-vomica", "Papaver somniferum", "Semecarpus anacardium",
    "Calotropis gigantea", "Nerium indicum", "Gloriosa superba",
    "Croton tiglium", "Plumbago zeylanica"
}

# ---------------------------------------------------------
# CYPHER QUERIES (Idempotent MERGE)
# ---------------------------------------------------------
CYPHER_SEED_REGULATIONS = """
// 1. Regulatory Authorities
MERGE (cdsco:Authority {name: 'Central Drugs Standard Control Organisation (CDSCO)', jurisdiction: 'Ministry of Health'})
MERGE (nba:Authority {name: 'National Biodiversity Authority (NBA)', jurisdiction: 'Ministry of Environment'})
MERGE (ayush:Authority {name: 'Ministry of Ayush', jurisdiction: 'Ayurveda, Yoga, Unani, Siddha, Homeopathy'})

// 2. Legal Acts & Rules
MERGE (dca:Act {name: 'Drugs and Cosmetics Act, 1940', section: 'Schedule E(1)'})
MERGE (bda:Act {name: 'Biological Diversity Act, 2002', section: 'Section 3 & 6'})

// 3. Mandatory Statutory Forms
MERGE (form24d:Form {name: 'Form 24D', purpose: 'Application for manufacture of Ayush drugs', type: 'Licensing'})
MERGE (form25d:Form {name: 'Form 25D', purpose: 'License issued for manufacture of Ayush drugs', type: 'Licensing'})
MERGE (form8:Form {name: 'Form 8', purpose: 'Application for IPR/Patent on biological resources', type: 'IPR'})
MERGE (form9:Form {name: 'Form 9', purpose: 'Commercial utilization and ABS fee agreement', type: 'Commercial'})

// 4. Base Relationships
MERGE (form24d)-[:FILED_WITH]->(cdsco)
MERGE (form25d)-[:ISSUED_BY]->(cdsco)
MERGE (form8)-[:FILED_WITH]->(nba)
MERGE (form9)-[:FILED_WITH]->(nba)
MERGE (dca)-[:GOVERNS]->(cdsco)
MERGE (bda)-[:GOVERNS]->(nba)
"""

CYPHER_SEED_PLANT = """
MERGE (p:Plant {botanical_name: $plant_name})
ON CREATE SET p.is_schedule_e1 = $is_poisonous
ON MATCH SET p.is_schedule_e1 = $is_poisonous

// Every Indian biological resource requires NBA clearance for patents
WITH p
MATCH (bda:Act {name: 'Biological Diversity Act, 2002'})
MATCH (form8:Form {name: 'Form 8'})
MERGE (p)-[:SUBJECT_TO]->(bda)
MERGE (p)-[:REQUIRES_IP_CLEARANCE]->(form8)

// If poisonous under Schedule E(1), mandate stringent CDSCO licensing
WITH p
WHERE p.is_schedule_e1 = true
MATCH (dca:Act {name: 'Drugs and Cosmetics Act, 1940'})
MATCH (form24d:Form {name: 'Form 24D'})
MERGE (p)-[:CLASSIFIED_AS_TOXIC_UNDER]->(dca)
MERGE (p)-[:MANDATES_MANUFACTURING_LICENSE]->(form24d)
"""

def init_base_ontology(tx):
    """Creates the statutory authorities, acts, and form nodes."""
    tx.run(CYPHER_SEED_REGULATIONS)

def insert_plant_batch(tx, plant_batch: List[str]):
    """Creates plant nodes and wires them to their specific regulatory requirements."""
    for plant in plant_batch:
        # Check against real statutory Schedule E(1) list
        is_poisonous = any(poison_name.lower() in plant.lower() for poison_name in SCHEDULE_E1_BOTANICALS)
        tx.run(CYPHER_SEED_PLANT, plant_name=plant, is_poisonous=is_poisonous)

def main():
    logger.info("========================================================")
    logger.info("🌐 INITIALIZING NEO4J REGULATORY KNOWLEDGE GRAPH")
    logger.info("========================================================")

    # 1. Fetch ALL distinct plants from Supabase using pagination
    logger.info("🔍 Extracting distinct botanical entities from Supabase (Paginated)...")
    unique_plants = set()
    start = 0
    step = 1000
    
    while True:
        res = supabase.table("imppat_therapeutics") \
            .select("plant_name") \
            .range(start, start + step - 1) \
            .execute()
            
        if not res.data:
            break
            
        for row in res.data:
            p_name = str(row.get("plant_name") or "").strip()
            if p_name:
                unique_plants.add(p_name)
        start += step

    plant_list = list(unique_plants)
    
    if not plant_list:
        logger.error("❌ No plants found in Supabase. Did the ingestion complete?")
        sys.exit(1)

    logger.info(f"   ↳ Extracted {len(plant_list)} unique botanical resources across all rows.")

    # 2. Execute Graph Transactions
    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            logger.info(f"Connected to database: {NEO4J_DATABASE}")
            # Seed the immutable legal frameworks
            logger.info("🏛️ Seeding statutory Authorities, Acts, and CDSCO/NBA Forms...")
            session.execute_write(init_base_ontology)
            
            # Batch insert plants to respect memory constraints
            batch_size = 500
            total_batches = (len(plant_list) + batch_size - 1) // batch_size
            
            logger.info(f"🌿 Wiring botanical resources to regulatory forms across {total_batches} batches...")
            for i in range(0, len(plant_list), batch_size):
                batch = plant_list[i:i + batch_size]
                session.execute_write(insert_plant_batch, batch)
                logger.info(f"   ↳ Batch {i // batch_size + 1}/{total_batches} wired successfully.")

        logger.info("✅ KNOWLEDGE GRAPH ONTOLOGY SEEDING COMPLETE.")
        
        # 3. Verification check (split to prevent subquery streaming warning)
        with driver.session(database=NEO4J_DATABASE) as session:
            total_nodes = session.run("MATCH (n) RETURN count(n) AS c").single()["c"]
            total_rels = session.run("MATCH ()-[r]->() RETURN count(r) AS c").single()["c"]
            
            logger.info("--------------------------------------------------------")
            logger.info(f"📊 DATABASE '{NEO4J_DATABASE}' STATS:")
            logger.info(f"   ↳ Total Nodes Created: {total_nodes}")
            logger.info(f"   ↳ Total Relationships: {total_rels}")
            logger.info("--------------------------------------------------------")
            
    except Exception as e:
        logger.error(f"❌ Neo4j Transaction Failed: {str(e)}")
    finally:
        driver.close()

if __name__ == "__main__":
    main()