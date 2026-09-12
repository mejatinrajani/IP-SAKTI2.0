import os
import requests
import logging

logger = logging.getLogger("PRIOR_ART")

def search_existing_patents(ingredients: list[str], medical_claim: str) -> list[dict]:
    """Queries Google Patents via SerpApi to find matching existing formulations."""
    serpapi_key = os.getenv("SERPAPI_API_KEY")
    if not serpapi_key:
        logger.warning("SERPAPI_API_KEY missing. Skipping live patent search.")
        return []

    if not ingredients and not medical_claim:
        return []

    # 1. Wrap each botanical ingredient in exact quotes to prevent loose token splitting
    quoted_ingredients = [f'"{ing.strip()}"' for ing in ingredients if ing.strip()]
    ingredients_part = " ".join(quoted_ingredients)

    # 2. Add relevant claim/indication keywords if present
    claim_part = f'"{medical_claim.strip()}"' if medical_claim.strip() else ""

    # Construct strict query: e.g. '"Centella asiatica" "Aloe vera" "skincare serum"'
    query_str = f"{ingredients_part} {claim_part}".strip()
    
    # Fallback to just ingredients if full query is empty
    if not query_str:
        query_str = ingredients_part

    params = {
        "engine": "google_patents",
        "q": query_str,
        "api_key": serpapi_key
    }

    logger.info(f"🔍 Executing Google Patents Query: {query_str}")

    try:
        response = requests.get("https://serpapi.com/search", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        results = data.get("organic_results", [])[:3]
        
        patents = []
        for item in results:
            patents.append({
                "title": item.get("title", "Unknown Title"),
                "patent_id": item.get("patent_id", item.get("publication_number", "Unknown ID")),
                "snippet": item.get("snippet", "No abstract available.")
            })
        return patents
        
    except Exception as e:
        logger.error(f"SerpApi Patent Search failed: {str(e)}")
        return []