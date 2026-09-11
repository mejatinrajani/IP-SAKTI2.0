import os
import logging
from typing import List, Dict, Optional
from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
logger = logging.getLogger("IMPPAT_COMPUTATIONAL_ENGINE")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class InnovationEvaluationRequest(BaseModel):
    plant_names: List[str] = Field(..., description="List of botanical plant names (e.g., ['Azadirachta indica', 'Curcuma longa'])")
    claimed_use: str = Field(..., description="Therapeutic use or commercial claim")

class CompoundBioActivity(BaseModel):
    compound_name: str
    molecular_weight: Optional[float]
    lipinski_status: Optional[str]

class FormulationMatch(BaseModel):
    classical_name: str
    reference_text: str

class InnovationReport(BaseModel):
    is_novel: bool
    magic_remedies_violation: bool
    dmr_warning: Optional[str]
    classical_prior_art: List[FormulationMatch]
    documented_traditional_uses: List[Dict[str, str]]
    active_phytochemicals: List[CompoundBioActivity]
    patentability_assessment: str
    regulatory_citations: List[str]

@router.post(
    "/evaluate-formulation",
    response_model=InnovationReport,
    summary="Zero-Hardcoding Computational & Regulatory Assessment"
)
async def evaluate_formulation(payload: InnovationEvaluationRequest = Body(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection uninitialized.")

    try:
        # ---------------------------------------------------------
        # 1. DYNAMIC DMR ACT CHECK (Zero Hardcoding)
        # ---------------------------------------------------------
        dmr_res = supabase.table("dmr_prohibited_diseases").select("disease_name").execute()
        prohibited_diseases = [row["disease_name"] for row in dmr_res.data] if dmr_res.data else []
        
        claimed_use_lower = payload.claimed_use.lower()
        dmr_violation = any(disease in claimed_use_lower for disease in prohibited_diseases)
        dmr_msg = None
        if dmr_violation:
            dmr_msg = (
                "STATUTORY BAR: The claimed therapeutic indication explicitly violates the "
                "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954. Direct curative claims "
                "for this condition are strictly prohibited under Indian law."
            )

        # ---------------------------------------------------------
        # 2. CLASSICAL PRIOR ART CHECK (Section 3(p) Bar)
        # ---------------------------------------------------------
        classical_matches = []
        documented_uses = []
        plant_ids = []

        for plant in payload.plant_names:
            clean_plant = plant.strip()
            
            # Fetch from imppat_plants
            p_res = supabase.table("imppat_plants") \
                .select("plant_id, scientific_name, ayurvedic_name") \
                .or_(f"scientific_name.ilike.%{clean_plant}%,ayurvedic_name.ilike.%{clean_plant}%,common_name.ilike.%{clean_plant}%") \
                .limit(2).execute()
                
            for row in p_res.data:
                if row["plant_id"] not in plant_ids:
                    plant_ids.append(row["plant_id"])

            # Fetch from imppat_therapeutics
            t_res = supabase.table("imppat_therapeutics") \
                .select("plant_name, therapeutic_use") \
                .ilike("plant_name", f"%{clean_plant}%") \
                .limit(5).execute()
            
            for row in t_res.data:
                documented_uses.append({
                    "plant": row["plant_name"],
                    "use": row["therapeutic_use"]
                })

        # Relational Join for Classical Formulations (Charaka Samhita, etc.)
        if plant_ids:
            map_res = supabase.table("imppat_formulation_plants") \
                .select("formulation_id, imppat_formulations(formulation_name, reference_text)") \
                .in_("plant_id", plant_ids) \
                .execute()
            
            for item in map_res.data:
                f_data = item.get("imppat_formulations")
                if f_data:
                    classical_matches.append(FormulationMatch(
                        classical_name=f_data["formulation_name"],
                        reference_text=f_data["reference_text"]
                    ))
        
        # Deduplicate formulation matches
        unique_formulations = {f.classical_name: f for f in classical_matches}.values()
        classical_matches = list(unique_formulations)[:10]

        # ---------------------------------------------------------
        # 3. MOLECULAR EFFICACY (Section 3(d) & Phytopharmaceutical Check)
        # ---------------------------------------------------------
        active_compounds = []
        seen_compounds = set()

        for plant in payload.plant_names:
            clean_plant = plant.strip()
            parts_res = supabase.table("imppat_plant_parts") \
                .select("imppat_id, plant_part, imppat_phytochemicals(name)") \
                .ilike("plant_name", f"%{clean_plant}%") \
                .limit(5).execute()

            for item in parts_res.data:
                imppat_id = str(item["imppat_id"]).strip()
                chem_data = item.get("imppat_phytochemicals")
                raw_name = chem_data["name"] if chem_data else "Unknown"

                # Sanitize scraped string artifacts (e.g. "RutinSummaryPhysicochemical..." -> "Rutin")
                clean_name = raw_name.split("Summary")[0].split("\n")[0].strip()
                
                if clean_name in seen_compounds or not clean_name:
                    continue
                seen_compounds.add(clean_name)

                # Fetch ADMET for molecular weight and Lipinski validation
                admet_res = supabase.table("imppat_admet") \
                    .select("molecular_weight, lipinski_rule_of_5") \
                    .eq("imppat_id", imppat_id) \
                    .maybe_single().execute()

                mw = None
                lipinski = None
                if admet_res and admet_res.data:
                    raw_mw = admet_res.data.get("molecular_weight")
                    if raw_mw and float(raw_mw) > 0:
                        mw = float(raw_mw)
                    lipinski = admet_res.data.get("lipinski_rule_of_5") or None

                active_compounds.append(CompoundBioActivity(
                    compound_name=clean_name,
                    molecular_weight=mw,
                    lipinski_status=lipinski
                ))

        # ---------------------------------------------------------
        # 4. SYNTHESIZE PATENTABILITY
        # ---------------------------------------------------------
        is_prior_art = len(classical_matches) > 0
        if is_prior_art:
            assessment = (
                "SECTION 3(p) STATUTORY BAR APPLIES: The botanical components exist within classical Ayurvedic compendia. "
                "To overcome Section 3(p) and Section 3(e) rejections, you must present empirical bio-assay data demonstrating "
                "synergistic activity or enhanced therapeutic efficacy beyond the documented traditional use."
            )
        else:
            assessment = (
                "NO DIRECT CLASSICAL PRIOR ART FOUND: The formulation does not precisely mirror indexed traditional recipes. "
                "Patent eligibility requires fulfilling novelty under Section 2(1)(j) and non-obviousness under Section 3(d)."
            )

        return InnovationReport(
            is_novel=not is_prior_art,
            magic_remedies_violation=dmr_violation,
            dmr_warning=dmr_msg,
            classical_prior_art=classical_matches,
            documented_traditional_uses=documented_uses[:10],
            active_phytochemicals=active_compounds[:5],
            patentability_assessment=assessment,
            regulatory_citations=[
                "Patents Act, 1970 (Section 3(p), Section 3(e), Section 3(d))",
                "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 (Section 3)",
                "New Drugs and Clinical Trials Rules, 2019 (Rule 2(1)(ee))"
            ]
        )

    except Exception as e:
        logger.error(f"Formulation evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Computational biological evaluation failed.")