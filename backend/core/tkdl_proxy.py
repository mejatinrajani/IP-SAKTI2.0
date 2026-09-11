import logging
from typing import List
from schemas import PriorArtRecord, TKDLProxyResponse

logger = logging.getLogger("TKDL_PROXY")

class TKDLProxyEngine:
    """
    Simulates a prior art search using open botanical databases (like IMPPAT) 
    to prevent fabricating official TKDL records.
    """
    def __init__(self):
        # In a full build, this would query a local SQLite/Postgres DB of IMPPAT data
        self.botanical_database = {
            "ashwagandha": {
                "botanical": "Withania somnifera",
                "uses": ["stress relief", "vitality", "immunity", "anti-inflammatory"],
                "chemicals": ["Withaferin A", "Withanolides"]
            },
            "neem": {
                "botanical": "Azadirachta indica",
                "uses": ["antibacterial", "skin disorders", "dental care", "blood purification"],
                "chemicals": ["Azadirachtin", "Nimbin"]
            },
            "turmeric": {
                "botanical": "Curcuma longa",
                "uses": ["wound healing", "anti-inflammatory", "digestion"],
                "chemicals": ["Curcumin", "Turmerone"]
            }
        }

    async def search_prior_art(self, ingredients: List[str]) -> TKDLProxyResponse:
        records = []
        found = False
        
        for item in ingredients:
            query_key = item.lower().strip()
            if query_key in self.botanical_database:
                found = True
                data = self.botanical_database[query_key]
                
                record = PriorArtRecord(
                    botanical_name=data["botanical"],
                    common_name=item.capitalize(),
                    traditional_uses=data["uses"],
                    phytochemicals=data["chemicals"],
                    proxy_source="IMPPAT Open Proxy",
                    patentability_warning=f"Matches known traditional uses. Section 3(p) bar likely if claimed for: {', '.join(data['uses'][:2])}."
                )
                records.append(record)

        return TKDLProxyResponse(
            query_ingredients=ingredients,
            prior_art_found=found,
            records=records,
            escalation_required=found, # If traditional use is found, flag for human IP facilitator
        )

tkdl_engine = TKDLProxyEngine()