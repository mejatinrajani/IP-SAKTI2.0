from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum
from datetime import datetime

# --- Module 1: IP Core & Classification Schemas ---

class FormulationCategory(str, Enum):
    CLASSICAL_GENERIC = "Classical / Generic Medicine (1st Schedule)"
    PATENT_PROPRIETARY = "Patent or Proprietary (P&P) Medicine"
    PHYTOPHARMACEUTICAL = "Phytopharmaceutical Drug"
    AYURVEDA_AAHAR = "Ayurveda-Aahar / Nutraceutical (FSSAI)"
    COSMETIC = "Cosmetic (Ayurvedic Base)"
    UNCLASSIFIED = "Unclassified / Custom"

class JurisdictionMode(str, Enum):
    INDIA = "India"
    INTERNATIONAL = "International"
    DUAL = "Dual"

class WizardStepInput(BaseModel):
    is_classical_text_recipe: bool = Field(..., description="Is formulation verbatim from a 1st Schedule text?")
    text_source_name: Optional[str] = Field(None, description="e.g., Charaka Samhita, Sahasrayogam, API")
    contains_purified_extract: bool = Field(..., description="Uses standardized solvent fractions or purified extract?")
    intended_use: Literal["internal_therapeutic", "food_supplement", "topical_cleansing"] = Field(...)
    uses_indian_bio_resource: bool = Field(True, description="Utilizes biological botanical or microbial resources from India?")

class ClassificationResult(BaseModel):
    category: FormulationCategory
    regulatory_act: str
    licensing_form: str
    patentability_verdict: str
    statutory_bars: List[str]
    abs_applicable: bool
    recommended_ip: List[str]

class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000)
    jurisdiction: JurisdictionMode = Field(default=JurisdictionMode.DUAL)
    classification: Optional[FormulationCategory] = None
    language: str = Field(default="en", description="ISO language code: en, hi, ta, etc.")

class CitationMetadata(BaseModel):
    statute: str
    section: str
    gazette_reference: Optional[str] = None
    verified_in_context: bool
    raw_tag: str

class JurisdictionAnswer(BaseModel):
    jurisdiction: str
    content: str
    citations: List[CitationMetadata]
    confidence_score: float
    is_abstained: bool
    abstention_reason: Optional[str] = None

class DualRAGResponse(BaseModel):
    query: str
    india_response: JurisdictionAnswer
    international_response: Optional[JurisdictionAnswer] = None
    audit_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    disclaimer: str = "Statutory information only. Does not constitute formal legal counsel under the Advocates Act, 1961."

# --- Module 2: Compliance & ABS Schemas ---

class FormulationRequest(BaseModel):
    ingredients: List[str] = Field(default_factory=list)
    is_classical_text_recipe: bool = Field(default=False)
    is_cultivated_plant: bool = Field(default=False, description="Cultivated plants are exempt under 2023 amendment")
    annual_turnover_cr: float = Field(..., ge=0, description="Annual ex-factory turnover in Crores (INR)")
    is_high_value_resource: bool = Field(default=False, description="e.g., Sandalwood, Red Sanders (min 5% ABS rate)")

class ABSCalculationResponse(BaseModel):
    abs_percentage: float
    status: str
    estimated_fee_cr: float

# Add this to the end of your schemas.py
class GraphTraversalResult(BaseModel):
    formulation_id: str
    compliance_paths: List[dict]


class PriorArtRecord(BaseModel):
    botanical_name: str
    common_name: str
    traditional_uses: List[str]
    phytochemicals: List[str]
    proxy_source: str
    patentability_warning: str

class TKDLProxyResponse(BaseModel):
    query_ingredients: List[str]
    prior_art_found: bool
    records: List[PriorArtRecord]
    escalation_required: bool
    disclaimer: str = "Search conducted on open proxy databases (IMPPAT). Official TKDL access requires Ministry facilitation."

# --- Module 4: Multilingual Translation (Bhashini) ---

class TranslationRequest(BaseModel):
    source_text: str = Field(..., description="The legal text to translate")
    source_lang: str = Field(default="en", description="ISO code (en, hi, ta, mr, etc.)")
    target_lang: str = Field(default="hi", description="ISO code (en, hi, ta, mr, etc.)")

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    is_mocked_fallback: bool = False