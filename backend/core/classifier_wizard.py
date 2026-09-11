import logging
from schemas import WizardStepInput, ClassificationResult, FormulationCategory

logger = logging.getLogger("IP_CORE_CLASSIFIER")

class FormulationClassifierWizard:
    """
    State machine executing the statutory classification logic under the
    Drugs & Cosmetics Act 1940, NDCT Rules 2019, and FSSAI 2022 Regulations.
    """

    @staticmethod
    def classify(user_input: WizardStepInput) -> ClassificationResult:
        # 1. Classical / Generic Formulation
        if user_input.is_classical_text_recipe:
            return ClassificationResult(
                category=FormulationCategory.CLASSICAL_GENERIC,
                regulatory_act="Drugs and Cosmetics Act, 1940 (Section 3(a))",
                licensing_form="Form 25D (AYUSH State Licensing Authority)",
                patentability_verdict="Non-patentable per se.",
                statutory_bars=[
                    "Section 3(p), Patents Act 1970 (Traditional Knowledge Bar)",
                    "Section 3(e), Patents Act 1970 (Mere Admixture Bar)"
                ],
                abs_applicable=user_input.uses_indian_bio_resource,
                recommended_ip=["Trademark (Class 5)", "Trade Dress (Designs Act 2000)", "Geographical Indication (if origin-linked)"]
            )

        # 2. Phytopharmaceutical Drug
        if user_input.contains_purified_extract and user_input.intended_use == "internal_therapeutic":
            return ClassificationResult(
                category=FormulationCategory.PHYTOPHARMACEUTICAL,
                regulatory_act="New Drugs and Clinical Trials (NDCT) Rules, 2019 (Rule 2(1)(ee))",
                licensing_form="Form CT-18 (CDSCO New Drug Division)",
                patentability_verdict="High patent potential if therapeutic efficacy and synergy are proven.",
                statutory_bars=[
                    "Section 3(d), Patents Act 1970 (Proof of Enhanced Efficacy required)",
                    "NBA Prior Approval required under Section 6 of Biological Diversity Act before patent grant"
                ],
                abs_applicable=True,
                recommended_ip=["Process/Product Patent (Form 1)", "Trademark (Class 5)", "Patent Cooperation Treaty (PCT) for Export"]
            )

        # 3. Ayurveda-Aahar (Food/Supplement)
        if user_input.intended_use == "food_supplement":
            return ClassificationResult(
                category=FormulationCategory.AYURVEDA_AAHAR,
                regulatory_act="Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
                licensing_form="FSSAI Central / State License (Category 13.0)",
                patentability_verdict="Low patentability; composition generally barred unless novel delivery matrix exists.",
                statutory_bars=[
                    "Section 3(p), Patents Act 1970",
                    "Prohibition of disease cure claims under FSSAI Advertising Regs"
                ],
                abs_applicable=user_input.uses_indian_bio_resource,
                recommended_ip=["Trademark (Class 30/32)", "Trade Secret (Proprietary recipe ratios)", "Design Registration for packaging"]
            )

        # 4. Cosmetic
        if user_input.intended_use == "topical_cleansing":
            return ClassificationResult(
                category=FormulationCategory.COSMETIC,
                regulatory_act="Drugs and Cosmetics Rules, 1945 (Part XIII - Cosmetics)",
                licensing_form="Form 32 (Cosmetics Manufacturing License)",
                patentability_verdict="Patentable only if novel topical delivery system or synthetic vehicle is developed.",
                statutory_bars=[
                    "Section 3(p), Patents Act 1970",
                    "Drugs & Magic Remedies Act 1954 (No therapeutic claim allowed)"
                ],
                abs_applicable=user_input.uses_indian_bio_resource,
                recommended_ip=["Trademark (Class 3)", "Design Registration (Bottle & Cap)", "Trade Dress Protection"]
            )

        # 5. Patent or Proprietary (P&P) Medicine (Default fallback)
        return ClassificationResult(
            category=FormulationCategory.PATENT_PROPRIETARY,
            regulatory_act="Drugs and Cosmetics Act, 1940 (Section 3(h))",
            licensing_form="Form 25D (with safety data and published textual references)",
            patentability_verdict="Patentable only if synergy between traditional ingredients is clinically validated.",
            statutory_bars=[
                "Section 3(e), Patents Act 1970 (Requires proof of synergism)",
                "Section 3(p), Patents Act 1970"
            ],
            abs_applicable=user_input.uses_indian_bio_resource,
            recommended_ip=["Synergistic Composition Patent (if validated)", "Trademark (Class 5)", "Trade Secret"]
        )