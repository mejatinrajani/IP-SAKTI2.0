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
BATCH_SIZE = 500

TARGET_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data", "imppat_raw", "IMPPAT_Human_Target_Proteins.csv"
)

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
            print(f"   ⚠️ Batch error at offset {i}: {e}")
    print(f"✅ Table '{table_name}' populated successfully.\n")

def main():
    print("=" * 65)
    print("🚀 INGESTING HUMAN TARGET PROTEINS ONLY")
    print("=" * 65)

    if not os.path.exists(TARGET_FILE):
        print(f"❌ File not found at: {TARGET_FILE}")
        return

    # 1. Fetch valid master phytochemical IDs from Supabase (Paginated to bypass 1000-row limit)
    print("🔍 Fetching valid phytochemical IDs from database...")
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

    # 2. Read CSV and handle flexible/truncated column names
    df = pd.read_csv(TARGET_FILE, sep=None, engine="python", on_bad_lines="skip").fillna("")
    print(f"   Detected Columns: {list(df.columns)}")

    records = []
    for _, r in df.iterrows():
        # Match any column variant for ID
        imppat_id = str(
            r.get("Phytochen") or r.get("Phytochem") or 
            r.get("Phytochemical_ID") or r.get("IMPPAT_ID") or 
            r.get(df.columns[0]) or ""
        ).strip()

        # Match protein ID
        prot_id = str(
            r.get("Protein_Id") or r.get("Protein ID") or 
            r.get(df.columns[1]) or ""
        ).strip()

        # Match HGNC symbol
        hgnc = str(
            r.get("HGNC_Syn") or r.get("HGNC_Synonym") or 
            r.get("HGNC_Symbol") or r.get("HGNC") or ""
        ).strip()

        # Parse score
        raw_score = r.get("STITCH_Sc") or r.get("STITCH_Score") or r.get("STITCH Score") or 0
        try:
            score = int(float(raw_score))
        except (ValueError, TypeError):
            score = 0

        source_url = str(r.get("Source_URL") or "").strip()

        # Foreign Key filter
        if imppat_id and prot_id and imppat_id in valid_ids:
            records.append({
                "imppat_id": imppat_id,
                "protein_id": prot_id,
                "hgnc_symbol": hgnc,
                "stitch_score": score,
                "source_url": source_url
            })

    print(f"✨ Successfully mapped {len(records)} valid target protein records.")
    batch_upsert("imppat_human_targets", records)

if __name__ == "__main__":
    main()