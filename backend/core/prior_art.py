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

    query_str = f"{' '.join(ingredients)} {medical_claim}".strip()
    if not query_str:
        return []

    params = {
        "engine": "google_patents",
        "q": query_str,
        "api_key": serpapi_key
    }

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