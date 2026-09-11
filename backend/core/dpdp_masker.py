import re
import logging
from typing import Tuple, Dict

logger = logging.getLogger("DPDP_MASKER")

class TradeSecretMasker:
    """
    DLP Middleware to mask proprietary ratios and ingredients before LLM processing,
    ensuring DPDP Act compliance.
    """
    def __init__(self):
        # Regex to catch percentages, weights, and volumes (e.g., "40%", "500mg", "2ml")
        self.quantity_pattern = re.compile(r'\b(\d+(?:\.\d+)?\s*(?:%|mg|g|kg|ml|l|grams|drops))\b', re.IGNORECASE)
        
    def mask_payload(self, text: str) -> Tuple[str, Dict[str, str]]:
        """Scrub sensitive metrics and store them in a temporary memory vault."""
        vault = {}
        masked_text = text
        
        for idx, match in enumerate(self.quantity_pattern.finditer(text)):
            secret_val = match.group(1)
            token = f"<REDACTED_QTY_{idx}>"
            vault[token] = secret_val
            masked_text = masked_text.replace(secret_val, token)
            
        return masked_text, vault
        
    def unmask_payload(self, masked_text: str, vault: Dict[str, str]) -> str:
        """Restore the sensitive metrics before sending the response to the user."""
        unmasked_text = masked_text
        for token, secret_val in vault.items():
            unmasked_text = unmasked_text.replace(token, secret_val)
        return unmasked_text

# Singleton instance
dpdp_masker = TradeSecretMasker()