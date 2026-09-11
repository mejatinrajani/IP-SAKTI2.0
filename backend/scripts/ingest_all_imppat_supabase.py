import os
import sys
import math
import time
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in your .env file.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BATCH_SIZE = 250  # Lowered to prevent timeout (57014)

# Targeted file map with aliases
TARGET_FILES = {
    "phytochemicals": ["IMPPAT_full_database.csv", "imppat_full_database.csv", "phytochemicals.csv"],
    "plant_parts": ["IMPPAT_Plant_Part_Associations.csv", "imppat_plant_part_associations.csv", "plant_parts.csv"],
    "therapeutics": ["IMPPAT_Therapeutic_Uses.csv", "imppat_therapeutic_uses.csv", "therapeutics.csv"],
    "human_targets": ["IMPPAT_Human_Target_Proteins.csv", "imppat_human_target_proteins.csv", "human_targets.csv"],
    "admet": ["IMPPAT_Properties_ADMET.csv", "imppat_properties_admet.csv", "admet.csv"]
}

def locate_file(file_keys):
    """Searches common project directories to find the target CSV."""
    search_dirs = [
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "imppat_raw"),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "data"),
        os.path.dirname(os.path.dirname(__file__)), # backend root
        os.getcwd(), # current terminal directory
        os.path.join(os.getcwd(), "data"),
        os.path.join(os.getcwd(), "data", "imppat_raw")
    ]
    
    for directory in search_dirs:
        if os.path.exists(directory):
            for candidate in os.listdir(directory):
                if candidate.lower() in [f.lower() for f in file_keys]:
                    return os.path.join(directory, candidate)
    return None

def batch_upsert(table_name: str, records: list):
    """Performs batched chunk upserts to avoid HTTP payload limits."""
    total = len(records)
    if total == 0:
        print(f"⚠️ No valid rows prepared for '{table_name}'. Skipping.")
        return
        
    total_batches = math.ceil(total / BATCH_SIZE)
    print(f"📦 Upserting {total} rows into table '{table_name}' across {total_batches} batches...")

    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        try:
            supabase.table(table_name).upsert(batch).execute()
            print(f"   ↳ Batch {i//BATCH_SIZE + 1}/{total_batches} committed ({len(batch)} rows)")
            
            # Rate-limiting: pause for 100 milliseconds
            time.sleep(0.1)
            
        except Exception as e:
            print(f"   ⚠️ Batch error at offset {i} on {table_name}: {e}")
    print(f"✅ Table '{table_name}' populated successfully.\n")

def main():
    print("=" * 70)
    print("🚀 AUTOMATIC IMPPAT 2.0 REPOSITORY INGESTION")
    print("=" * 70)
    
    # Store valid primary keys to prevent FK constraint violations in child tables
    valid_imppat_ids = set()

    # 1. IMPPAT_full_database.csv -> imppat_phytochemicals
    p_file = locate_file(TARGET_FILES["phytochemicals"])
    if p_file:
        print(f"🔍 Found Phytochemicals CSV at: {p_file}")
        df = pd.read_csv(p_file, low_memory=False).fillna("")
        records = []
        for _, r in df.iterrows():
            imppat_id = str(r.get("IMPPAT_ID") or r.get("IMPPAT ID") or r.get("Phytochemical_ID") or "").strip()
            name = str(r.get("Name") or r.get("Compound_Name") or "").strip()
            if imppat_id and name:
                valid_imppat_ids.add(imppat_id)
                records.append({
                    "imppat_id": imppat_id,
                    "name": name,
                    "smiles": str(r.get("SMILES") or "").strip(),
                    "inchi": str(r.get("InChI") or "").strip(),
                    "inchikey": str(r.get("InChIKey") or "").strip(),
                    "synonyms": str(r.get("Synonyms") or "").strip(),
                    "source_page": str(r.get("Source_Page") or "").strip()
                })
        batch_upsert("imppat_phytochemicals", records)
    else:
        print("❌ Could NOT locate 'IMPPAT_full_database.csv'")

    # 2. IMPPAT_Properties_ADMET.csv -> imppat_admet
    a_file = locate_file(TARGET_FILES["admet"])
    if a_file:
        print(f"🔍 Found ADMET CSV at: {a_file}")
        df = pd.read_csv(a_file, low_memory=False).fillna(0)
        records = []
        for _, r in df.iterrows():
            imppat_id = str(r.get("Phytochemical_ID") or r.get("Phytochemical ID") or r.get("IMPPAT_ID") or "").strip()
            # Foreign Key Guard: Only insert if parent exists
            if imppat_id and imppat_id in valid_imppat_ids:
                try:
                    records.append({
                        "imppat_id": imppat_id,
                        "molecular_weight": float(r.get("Molecular Weight") or r.get("Molecular_Weight") or 0),
                        "logp": float(r.get("Log P") or r.get("Log_P") or 0),
                        "tpsa": float(r.get("Topological Polar Surface Area") or r.get("Topological_Polar_Surface_Area") or 0),
                        "lipinski_rule_of_5": str(r.get("Lipinski's Rule of 5") or r.get("Lipinski") or ""),
                        "bioavailability_score": float(r.get("Bioavailability Score") or 0.55),
                        "gastrointestinal_absorption": str(r.get("Gastrointestinal absorption") or ""),
                        "blood_brain_barrier": str(r.get("Blood Brain Barrier") or "")
                    })
                except Exception:
                    continue
        batch_upsert("imppat_admet", records)
    else:
        print("❌ Could NOT locate 'IMPPAT_Properties_ADMET.csv'")

    # 3. IMPPAT_Plant_Part_Associations.csv -> imppat_plant_parts
    pp_file = locate_file(TARGET_FILES["plant_parts"])
    if pp_file:
        print(f"🔍 Found Plant-Part Associations CSV at: {pp_file}")
        df = pd.read_csv(pp_file, low_memory=False).fillna("")
        records = []
        for _, r in df.iterrows():
            imppat_id = str(r.get("Phytochemical_ID") or r.get("Phytochemical ID") or r.get("IMPPAT_ID") or "").strip()
            p_name = str(r.get("Plant_Name") or r.get("Plant Name") or "").strip()
            # Foreign Key Guard
            if imppat_id and p_name and imppat_id in valid_imppat_ids:
                records.append({
                    "imppat_id": imppat_id,
                    "plant_name": p_name,
                    "plant_part": str(r.get("Plant_Part") or r.get("Plant Part") or "").strip(),
                    "reference_lit": str(r.get("Reference") or "").strip(),
                    "source_url": str(r.get("Source_URL") or "").strip()
                })
        batch_upsert("imppat_plant_parts", records)
    else:
        print("❌ Could NOT locate 'IMPPAT_Plant_Part_Associations.csv'")

    # 4. IMPPAT_Therapeutic_Uses.csv -> imppat_therapeutics
    t_file = locate_file(TARGET_FILES["therapeutics"])
    if t_file:
        print(f"🔍 Found Therapeutic Uses CSV at: {t_file}")
        # Uses sep=None with python engine to detect tabs or commas automatically
        df = pd.read_csv(t_file, sep=None, engine="python", on_bad_lines="skip").fillna("")
        records = []
        for _, r in df.iterrows():
            p_name = str(r.get("Plant_Name") or r.get("Plant Name") or "").strip()
            t_use = str(r.get("Therapeutic_Use") or r.get("Therapeutic Use") or "").strip()
            if p_name and t_use:
                records.append({
                    "plant_name": p_name,
                    "plant_part": str(r.get("Plant_Part") or r.get("Plant Part") or "").strip(),
                    "therapeutic_use": t_use,
                    "identifiers": str(r.get("Identifiers") or "").strip(),
                    "source_url": str(r.get("Source_URL") or "").strip()
                })
        batch_upsert("imppat_therapeutics", records)
    else:
        print("❌ Could NOT locate 'IMPPAT_Therapeutic_Uses.csv'")

    # 5. IMPPAT_Human_Target_Proteins.csv -> imppat_human_targets
    ht_file = locate_file(TARGET_FILES["human_targets"])
    if ht_file:
        print(f"🔍 Found Human Targets CSV at: {ht_file}")
        df = pd.read_csv(ht_file, low_memory=False).fillna("")
        records = []
        for _, r in df.iterrows():
            imppat_id = str(r.get("Phytochemical_ID") or r.get("Phytochemical ID") or r.get("IMPPAT_ID") or "").strip()
            prot_id = str(r.get("Protein_Id") or r.get("Protein ID") or "").strip()
            # Foreign Key Guard
            if imppat_id and prot_id and imppat_id in valid_imppat_ids:
                try:
                    score = int(r.get("STITCH_Score") or r.get("STITCH Score") or 0)
                except ValueError:
                    score = 0
                records.append({
                    "imppat_id": imppat_id,
                    "protein_id": prot_id,
                    "hgnc_symbol": str(r.get("HGNC_Symbol") or r.get("HGNC_Synonym") or "").strip(),
                    "stitch_score": score,
                    "source_url": str(r.get("Source_URL") or "").strip()
                })
        batch_upsert("imppat_human_targets", records)
    else:
        print("❌ Could NOT locate 'IMPPAT_Human_Target_Proteins.csv'")

    print("=" * 70)
    print("🎯 INGESTION PROCESS COMPLETED.")
    print("=" * 70)

if __name__ == "__main__":
    main()