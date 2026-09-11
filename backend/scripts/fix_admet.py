import os
import sys
import math
import time
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
BATCH_SIZE = 500

TARGET_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data", "imppat_raw", "IMPPAT_Properties_ADMET.csv"
)

def main():
    print("=" * 65)
    print("🧪 SURGICAL ADMET FIX (FUZZY COLUMN MATCHING)")
    print("=" * 65)

    if not os.path.exists(TARGET_FILE):
        print(f"❌ Could not find {TARGET_FILE}")
        return

    # Use python engine to handle weird encodings gracefully
    df = pd.read_csv(TARGET_FILE, sep=None, engine="python", on_bad_lines="skip").fillna(0)
    
    # Fuzzy match the exact columns regardless of typos or weird characters
    id_col = next((c for c in df.columns if 'Phyto' in c or 'IMPPAT' in c), df.columns[0])
    mw_col = next((c for c in df.columns if 'Molecular' in c), None)
    lipinski_col = next((c for c in df.columns if 'Lipinski' in c), None)

    print(f"🔍 Mapping Columns:\n  ID -> '{id_col}'\n  MW -> '{mw_col}'\n  Lipinski -> '{lipinski_col}'")

    if not mw_col or not lipinski_col:
        print("❌ Could not dynamically identify Molecular Weight or Lipinski columns.")
        return

    records = []
    for _, r in df.iterrows():
        imppat_id = str(r[id_col]).strip()
        
        try:
            mw = float(r[mw_col])
        except (ValueError, TypeError):
            mw = 0.0
            
        lipinski = str(r[lipinski_col]).strip()
        # Clean up empty artifacts
        if lipinski == "0" or lipinski == "0.0":
            lipinski = ""

        if imppat_id:
            records.append({
                "imppat_id": imppat_id,
                "molecular_weight": mw,
                "lipinski_rule_of_5": lipinski
            })

    total = len(records)
    total_batches = math.ceil(total / BATCH_SIZE)
    print(f"\n📦 Updating {total} ADMET records across {total_batches} batches...")

    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        try:
            # Upsert will strictly update the MW and Lipinski columns for existing IDs
            supabase.table("imppat_admet").upsert(batch).execute()
            print(f"   ↳ Batch {i//BATCH_SIZE + 1}/{total_batches} updated")
            time.sleep(0.05)
        except Exception as e:
            print(f"   ⚠️ Batch error: {e}")
            
    print("✅ ADMET table successfully patched.")

if __name__ == "__main__":
    main()