import logging
from typing import Dict, Any
from decimal import Decimal, ROUND_HALF_UP

logger = logging.getLogger("ABS_CALCULATOR")

class ABSCalculator:
    def __init__(self):
        # 2014 Guidelines Commercial Utilization Tiers (Exact Statutory Limits)
        self.TIER_1_LIMIT = Decimal("10000000.00")  # 1 Crore
        self.TIER_2_LIMIT = Decimal("30000000.00")  # 3 Crores
        
        # Statutory Commercial Utilization Rates
        self.RATE_TIER_1 = Decimal("0.001")         # 0.1%
        self.RATE_TIER_2 = Decimal("0.002")         # 0.2%
        self.RATE_TIER_3 = Decimal("0.005")         # 0.5%
        
        # Statutory IPR Licensing Rate Bands
        self.RATE_IPR_UPFRONT_MIN = Decimal("0.03") # 3.0%
        self.RATE_IPR_UPFRONT_MAX = Decimal("0.05") # 5.0%
        self.RATE_IPR_ROYALTY_MIN = Decimal("0.02") # 2.0%
        self.RATE_IPR_ROYALTY_MAX = Decimal("0.05") # 5.0%

    def _format_currency(self, amount: Decimal) -> float:
        """Rounds to nearest Paisa for financial compliance."""
        return float(amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    def calculate(self, req: Any) -> Dict[str, Any]:
        logger.info(f"🧮 Calculating Exact ABS Liability for: {req.applicant_type} | Purpose: {req.purpose}")
        reality_checks = []
        
        # 1. Statutory Exemptions (2023 Amendment)
        if req.applicant_type == "registered_ayush_practitioner":
            return {
                "is_exempt": True,
                "exemption_reason": "Exempted under Section 7 of the Biological Diversity (Amendment) Act, 2023 (Registered Vaidyas/Hakims).",
                "calculated_abs_fee_inr": 0.0,
                "calculated_max_fee_inr": 0.0,
                "applied_rate_description": "0.0% (Statutory Exemption)",
                "statutory_reality_check": [
                    "While financially exempt, practitioners must strictly ensure biological resources are not sourced from the NBA's Normally Traded Commodities (NTC) restricted list or endangered species."
                ]
            }

        # 2. Commercial Utilization (Form 9)
        if req.purpose == "commercial_utilization":
            sales = Decimal(str(req.gross_annual_sales_inr))
            fee = Decimal("0.00")
            
            if sales <= self.TIER_1_LIMIT:
                fee = sales * self.RATE_TIER_1
                rate_desc = "0.1% on Gross Ex-Factory Sales (Turnover ≤ ₹1 Crore)"
            elif sales <= self.TIER_2_LIMIT:
                fee = sales * self.RATE_TIER_2
                rate_desc = "0.2% on Gross Ex-Factory Sales (Turnover between ₹1-3 Crores)"
            else:
                fee = sales * self.RATE_TIER_3
                rate_desc = "0.5% on Gross Ex-Factory Sales (Turnover > ₹3 Crores)"
                
            fee_float = self._format_currency(fee)
            reality_checks.append("ABS is calculated on GROSS Ex-Factory Sales. Profit margins, operating losses, or R&D expenditures cannot be deducted from this liability.")
            reality_checks.append("Form 9 execution timelines currently average 6 to 14 months. Commercial manufacturing prior to agreement execution is a cognizable offense.")
            
            return {
                "is_exempt": False,
                "exemption_reason": None,
                "calculated_abs_fee_inr": fee_float,
                "calculated_max_fee_inr": fee_float,  # Exact rate, so min and max are the same
                "applied_rate_description": rate_desc,
                "statutory_reality_check": reality_checks
            }

        # 3. IPR Licensing (Form 8)
        if req.purpose == "ipr_licensing":
            upfront = Decimal(str(req.upfront_licensing_fee_inr))
            royalty = Decimal(str(req.annual_royalty_inr))
            
            min_fee = (upfront * self.RATE_IPR_UPFRONT_MIN) + (royalty * self.RATE_IPR_ROYALTY_MIN)
            max_fee = (upfront * self.RATE_IPR_UPFRONT_MAX) + (royalty * self.RATE_IPR_ROYALTY_MAX)
            
            reality_checks.append("The NBA Expert Committee has statutory discretion to set the final rate between 3-5% for upfront fees and 2-5% for royalties based on the scope of the patent.")
            reality_checks.append("If the licensee is a foreign entity, Section 3 of the BDA strictly applies, requiring prior NBA approval before the licensing contract is legally valid.")
            
            return {
                "is_exempt": False,
                "exemption_reason": None,
                "calculated_abs_fee_inr": self._format_currency(min_fee),
                "calculated_max_fee_inr": self._format_currency(max_fee),
                "applied_rate_description": "Statutory Band: 3.0%-5.0% (Upfront) + 2.0%-5.0% (Royalty)",
                "statutory_reality_check": reality_checks
            }
            
        return {
            "is_exempt": False,
            "calculated_abs_fee_inr": 0.0,
            "calculated_max_fee_inr": 0.0,
            "applied_rate_description": "Requires Manual NBA Assessment",
            "statutory_reality_check": ["This purpose falls outside standard deterministic brackets. Requires NBA Expert Committee review."]
        }

abs_calculator = ABSCalculator()