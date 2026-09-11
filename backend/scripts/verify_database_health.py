import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# The 6 active tables powering IP-SAKTI 2.0
TARGET_TABLES = [
    "imppat_phytochemicals",
    "imppat_admet",
    "imppat_human_targets",
    "imppat_plant_parts",
    "imppat_therapeutics",
    "dmr_prohibited_diseases"
]

def main():
    print("=" * 70)
    print("🩺 SUPABASE DATABASE HEALTH & INTEGRITY CHECK")
    print("=" * 70)

    total_system_rows = 0

    for table in TARGET_TABLES:
        try:
            # count="exact" tells Postgres to count rows without returning the massive payload
            # limit=1 fetches just a single row to prove the schema isn't corrupted
            res = supabase.table(table).select("*", count="exact").limit(1).execute()
            
            row_count = res.count if res.count is not None else 0
            total_system_rows += row_count
            
            status = "✅ HEALTHY" if row_count > 0 else "⚠️ EMPTY"
            print(f"{status} | {table.ljust(30)} | {row_count:,} rows")
            
            if row_count > 0 and res.data:
                sample_keys = list(res.data[0].keys())[:4] # Show first 4 columns to verify schema
                print(f"            ↳ Columns detected: {sample_keys}")

        except Exception as e:
            print(f"❌ ERROR  | {table.ljust(30)} | Failed to query: {e}")

    print("-" * 70)
    print(f"🚀 TOTAL RELATIONAL ROWS INDEXED: {total_system_rows:,}")
    print("=" * 70)

if __name__ == "__main__":
    main()