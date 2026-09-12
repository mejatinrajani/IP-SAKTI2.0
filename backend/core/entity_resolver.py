import os
import re
import logging
from typing import List, Dict, Optional, Tuple
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("ENTITY_RESOLVER")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "sih2026")

# -------------------------------------------------------------------
# COMPREHENSIVE VERNACULAR & AYURVEDIC ALIAS REGISTRY
# Maps English / Hindi / Sanskrit common names to Latin Binomials
# -------------------------------------------------------------------
VERNACULAR_TO_BOTANICAL = {
    # Schedule E(1) Toxic Plants
    "bhang": "Cannabis sativa",
    "cannabis": "Cannabis sativa",
    "marijuana": "Cannabis sativa",
    "ganja": "Cannabis sativa",
    "hemp": "Cannabis sativa",
    "vijaya": "Cannabis sativa",
    "datura": "Datura metel",
    "dhatura": "Datura metel",
    "thorn apple": "Datura metel",
    "jimsonweed": "Datura stramonium",
    "vatsanabha": "Aconitum ferox",
    "monkshood": "Aconitum ferox",
    "aconite": "Aconitum ferox",
    "meetha vish": "Aconitum ferox",
    "gunja": "Abrus precatorius",
    "jequirity": "Abrus precatorius",
    "ratti": "Abrus precatorius",
    "kuchla": "Strychnos nux-vomica",
    "nux vomica": "Strychnos nux-vomica",
    "vishamushti": "Strychnos nux-vomica",
    "afeem": "Papaver somniferum",
    "opium": "Papaver somniferum",
    "poppy": "Papaver somniferum",
    "khas khas": "Papaver somniferum",
    "bhallataka": "Semecarpus anacardium",
    "marking nut": "Semecarpus anacardium",
    "bhilawa": "Semecarpus anacardium",
    "aak": "Calotropis gigantea",
    "arka": "Calotropis gigantea",
    "crown flower": "Calotropis gigantea",
    "madar": "Calotropis gigantea",
    "karvira": "Nerium indicum",
    "kaner": "Nerium indicum",
    "oleander": "Nerium indicum",
    "langali": "Gloriosa superba",
    "glory lily": "Gloriosa superba",
    "kalihari": "Gloriosa superba",
    "jayapala": "Croton tiglium",
    "croton": "Croton tiglium",
    "jamalgota": "Croton tiglium",
    "chitraka": "Plumbago zeylanica",
    "leadwort": "Plumbago zeylanica",

    # Classical Ayurvedic & Commercial Botanicals
    "ashwagandha": "Withania somnifera",
    "indian ginseng": "Withania somnifera",
    "asgandh": "Withania somnifera",
    "neem": "Azadirachta indica",
    "nimba": "Azadirachta indica",
    "tulsi": "Ocimum sanctum",
    "holy basil": "Ocimum sanctum",
    "haritaki": "Terminalia chebula",
    "harad": "Terminalia chebula",
    "bibhitaki": "Terminalia bellirica",
    "baheda": "Terminalia bellirica",
    "amla": "Phyllanthus emblica",
    "amalaki": "Phyllanthus emblica",
    "indian gooseberry": "Phyllanthus emblica",
    "guduchi": "Tinospora cordifolia",
    "giloy": "Tinospora cordifolia",
    "amrita": "Tinospora cordifolia",
    "brahmi": "Bacopa monnieri",
    "water hyssop": "Bacopa monnieri",
    "shatavari": "Asparagus racemosus",
    "safed musli": "Chlorophytum borivilianum",
    "turmeric": "Curcuma longa",
    "haldi": "Curcuma longa",
    "haridra": "Curcuma longa",
    "ginger": "Zingiber officinale",
    "adrak": "Zingiber officinale",
    "sunthi": "Zingiber officinale",
    "black pepper": "Piper nigrum",
    "kali mirch": "Piper nigrum",
    "maricha": "Piper nigrum",
    "pippali": "Piper longum",
    "long pepper": "Piper longum",
    "licorice": "Glycyrrhiza glabra",
    "mulethi": "Glycyrrhiza glabra",
    "yashtimadhu": "Glycyrrhiza glabra",
    "ghritkumari": "Aloe vera",
    "aloe vera": "Aloe vera",
    "aloe": "Aloe vera",
    "kathal": "Artocarpus heterophyllus",
    "jackfruit": "Artocarpus heterophyllus",
    "guggulu": "Commiphora mukul",
    "guggul": "Commiphora mukul",
    "vidanga": "Embelia ribes",
    "kutki": "Picrorhiza kurrooa",
    "manjistha": "Rubia cordifolia",
    "punarnava": "Boerhavia diffusa",
    "arjuna": "Terminalia arjuna",
    "shankhpushpi": "Convolvulus pluricaulis",
    "sarpgandha": "Rauvolfia serpentina",
    "bhringraj": "Eclipta alba"
}

class EntityResolver:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    def close(self):
        self.driver.close()

    def _normalize_string(self, text: str) -> str:
        """Strips punctuation, excessive whitespace, and lowercases text."""
        return re.sub(r'[^\w\s]', '', text).strip().lower()

    def resolve_plant_name(self, raw_input_name: str) -> Tuple[str, str, float]:
        """
        Resolves a user-provided plant name to its canonical botanical name.
        
        Returns:
            (canonical_botanical_name, match_source, confidence_score)
        """
        cleaned = self._normalize_string(raw_input_name)
        if not cleaned:
            return raw_input_name, "none", 0.0

        # Layer 1: Direct Vernacular / Ayurvedic Dictionary Lookup
        if cleaned in VERNACULAR_TO_BOTANICAL:
            canonical = VERNACULAR_TO_BOTANICAL[cleaned]
            logger.info(f"🌿 Vernacular Match: '{raw_input_name}' -> '{canonical}' (100% confidence)")
            return canonical, "vernacular_registry", 1.0

        # Layer 2: Substring / Exact match in Vernacular Dictionary keys
        for alias, botanical in VERNACULAR_TO_BOTANICAL.items():
            if alias in cleaned or cleaned in alias:
                logger.info(f"🌿 Vernacular Substring Match: '{raw_input_name}' -> '{botanical}'")
                return botanical, "vernacular_substring", 0.95

        # Layer 3: Neo4j Full-Text Lucene Fuzzy Search
        # Lucene ~0.7 enables typo tolerance (e.g., 'Cannibis sativva' -> 'Cannabis sativa')
        fuzzy_query = """
        CALL db.index.fulltext.queryNodes("plant_names_index", $search_term) 
        YIELD node, score
        RETURN node.botanical_name AS botanical_name, score
        ORDER BY score DESC
        LIMIT 1
        """
        search_term = f"{cleaned}~0.7"
        
        try:
            with self.driver.session() as session:
                result = session.run(fuzzy_query, search_term=search_term).single()
                if result and result["score"] >= 0.5:
                    matched_name = result["botanical_name"]
                    score = float(result["score"])
                    logger.info(f"🔍 Neo4j Lucene Fuzzy Match: '{raw_input_name}' -> '{matched_name}' (score: {score:.2f})")
                    return matched_name, "neo4j_fulltext", score
        except Exception as e:
            logger.warning(f"Neo4j Fulltext query failed: {e}. Falling back to standard query.")

        # Layer 4: Fallback ILIKE match in Neo4j
        fallback_query = """
        MATCH (p:Plant)
        WHERE toLower(p.botanical_name) CONTAINS toLower($name)
        RETURN p.botanical_name AS botanical_name
        LIMIT 1
        """
        try:
            with self.driver.session() as session:
                result = session.run(fallback_query, name=cleaned).single()
                if result:
                    matched_name = result["botanical_name"]
                    logger.info(f"🔍 Neo4j Fallback Substring: '{raw_input_name}' -> '{matched_name}'")
                    return matched_name, "neo4j_ilike", 0.8
        except Exception as e:
            logger.error(f"Fallback Neo4j search error: {e}")

        # Layer 5: Unresolved, pass original raw term
        return raw_input_name, "unresolved", 0.0

    def resolve_plant_list(self, raw_plants: List[str]) -> List[str]:
        """Resolves an entire list of plant strings to canonical Latin botanical names."""
        resolved = []
        for plant in raw_plants:
            canonical, source, score = self.resolve_plant_name(plant)
            if canonical not in resolved:
                resolved.append(canonical)
        return resolved

# Singleton instance
entity_resolver = EntityResolver()