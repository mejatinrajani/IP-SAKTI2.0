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
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BATCH_SIZE = 250

TARGET_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data", "imppat_raw", "IMPPAT_Properties_ADMET.csv"
)

def find_column(df: pd.DataFrame, keywords: list) -> str:
    """Finds the first column in the DataFrame containing any of the given keywords."""
    for col in df.columns:
        col_clean = str(col).lower().strip()
        if any(kw.lower() in col_clean for kw in keywords):
            return col
    return ""

def safe_float(val, default=0.0) -> float:
    try:
        if pd.isna(val) or val == "" or val is None:
            return default
        return float(val)
    except (ValueError, TypeError):
        return default

def batch_upsert(table_name: str, records: list):
    total = len(records)
    total_batches = math.ceil(total / BATCH_SIZE)
    print(f"📦 Upserting {total} rows into '{table_name}' across {total_batches} batches...")

    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        try:
            supabase.table(table_name).upsert(batch).execute()
            print(f"   ↳ Batch {i//BATCH_SIZE + 1}/{total_batches} committed ({len(batch)} rows)")
            time.sleep(0.05)
        except Exception as e:
            print(f"   ⚠️ Batch error at offset {i} on {table_name}: {e}")
    print(f"✅ Table '{table_name}' populated successfully.\n")

def main():
    print("=" * 65)
    print("🚀 RE-INGESTING ADMET PROPERTIES (IMPPAT 2.0)")
    print("=" * 65)

    if not os.path.exists(TARGET_FILE):
        print(f"❌ File not found at: {TARGET_FILE}")
        sys.exit(1)

    # 1. Fetch valid parent phytochemical IDs
    print("🔍 Fetching valid phytochemical IDs from Supabase to protect foreign keys...")
    valid_ids = set()
    start = 0
    step = 1000
    while True:
        parent_res = supabase.table("imppat_phytochemicals").select("imppat_id").range(start, start + step - 1).execute()
        if not parent_res.data:
            break
        for row in parent_res.data:
            valid_ids.add(row["imppat_id"])
        start += step
        
    print(f"   Found {len(valid_ids)} registered parent IDs.")

    # 2. Read CSV
    print(f"📖 Reading CSV: {TARGET_FILE}")
    df = pd.read_csv(TARGET_FILE, sep=None, engine="python", on_bad_lines="skip").fillna("")
    print(f"   Total CSV rows: {len(df)}")
    print(f"   Detected Columns: {list(df.columns)[:8]} ...")

    # 3. Dynamic Column Mapping
    col_id = find_column(df, ["phytochemical", "imppat_id", "imppat id"]) or df.columns[0]
    col_mw = find_column(df, ["molecular weight", "molecular_weight", "molecular"])
    col_logp = find_column(df, ["log p", "logp", "log_p"])
    col_tpsa = find_column(df, ["topological polar surface area", "tpsa", "polar surface"])
    col_lipinski = find_column(df, ["lipinski"])
    col_bio = find_column(df, ["bioavailability score", "bioavailability"])
    col_gi = find_column(df, ["gastrointestinal", "gi absorption"])
    col_bbb = find_column(df, ["blood brain barrier", "bbb"])

    print("\n🔍 Column Resolution:")
    print(f"   ID:       '{col_id}'")
    print(f"   MW:       '{col_mw}'")
    print(f"   LogP:     '{col_logp}'")
    print(f"   TPSA:     '{col_tpsa}'")
    print(f"   Lipinski: '{col_lipinski}'")
    print(f"   BioAvail: '{col_bio}'")
    print(f"   GI Abs:   '{col_gi}'")
    print(f"   BBB:      '{col_bbb}'\n")

    # 4. Prepare validated records
    records = []
    for _, r in df.iterrows():
        imppat_id = str(r.get(col_id, "")).strip()

        # Only insert if ID exists and matches an existing parent in imppat_phytochemicals
        if imppat_id and imppat_id in valid_ids:
            records.append({
                "imppat_id": imppat_id,
                "molecular_weight": safe_float(r.get(col_mw)),
                "logp": safe_float(r.get(col_logp)),
                "tpsa": safe_float(r.get(col_tpsa)),
                "lipinski_rule_of_5": str(r.get(col_lipinski, "")).strip(),
                "bioavailability_score": safe_float(r.get(col_bio), default=0.55),
                "gastrointestinal_absorption": str(r.get(col_gi, "")).strip(),
                "blood_brain_barrier": str(r.get(col_bbb, "")).strip()
            })

    print(f"✨ Successfully prepared {len(records)} valid records for upsert.")
    batch_upsert("imppat_admet", records)
    print("=" * 65)
    print("🎯 ADMET DATASET RE-INGESTION COMPLETE.")
    print("=" * 65)

if __name__ == "__main__":
    main()