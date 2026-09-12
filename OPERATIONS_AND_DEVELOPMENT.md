# Operations and Development

## 1. Local Setup

### Backend environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start the API:

```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or run the module entry point:

```powershell
python main.py
```

### Frontend environment

```powershell
cd frontend
npm install
npm run dev
```

Available scripts from `frontend/package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint checks |
| `npm run preview` | Serve the built bundle locally |

## 2. Environment Variables

### Backend `.env`

| Variable | Required for | Notes |
|---|---|---|
| `SUPABASE_URL` | Supabase, JWT verification | Project URL |
| `SUPABASE_KEY` | Backend database access | Keep server-side; use the least privilege appropriate to the deployment |
| `NEO4J_URI` | Neo4j graph and resolver | Bolt/Neo4j URI |
| `NEO4J_USER` | Neo4j | Database user |
| `NEO4J_PASSWORD` | Neo4j | Secret |
| `NEO4J_DATABASE` | Neo4j | Defaults differ between modules; set explicitly |
| `GROQ_API_KEY` | Agentic classifier | Fast structured extraction |
| `GROQ_API_KEY_2` | Semantic validator | LLM-as-a-judge grounding |
| `GROQ_API_KEY_3` | Main orchestrator | Entity extraction, DMR, synthesis |
| `GROQ_API_KEY_4` | Sarvam fallback | Optional translation fallback |
| `GROQ_API_KEY_5` | Dual RAG engine | Statutory answer synthesis |
| `BHASHINI_UDYAT_KEY` | Bhashini client configuration | Loaded by client; inference request uses the inference key |
| `BHASHINI_INFERENCE_KEY` | Bhashini translation | Authorization header |
| `SARVAM_API_KEY` | Alternate translation client | Not the active router path |
| `SERPAPI_API_KEY` | Prior-art search | Missing key disables live patent lookup |

### Frontend `.env`

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The current frontend has fallback placeholder values in `src/lib/supabase.js`; replace them in every real environment and fail fast rather than silently using placeholders for a deployed product.

## 3. Data Initialization Order

1. Create Supabase tables, relationships, indexes, and Row Level Security policies.
2. Upload or place the five IMPPAT raw CSV files under `backend/data/imppat_raw`.
3. Run the full IMPPAT ingestion:

   ```powershell
   cd backend
   python scripts/ingest_all_imppat_supabase.py
   ```

4. Load human targets if needed:

   ```powershell
   python scripts/ingest_human_targets_only.py
   ```

5. Re-ingest ADMET after correcting a source file:

   ```powershell
   python scripts/reingest_admet_only.py
   ```

6. Index the curated legal corpus:

   ```powershell
   python scripts/ingest_legal_corpus.py
   ```

7. Seed Neo4j from the populated therapeutic table:

   ```powershell
   python scripts/seed_neo4j_graph.py
   ```

8. Verify the six primary Supabase biological/DMR tables:

   ```powershell
   python scripts/verify_database_health.py
   ```

Do not run the Neo4j seed before `imppat_therapeutics` contains plant names. The script exits if no plants are found.

## 4. Development Checks

```powershell
# Frontend
cd frontend
npm run lint
npm run build

# Backend syntax/import compilation
cd ..\backend
python -m compileall .
```

A LangGraph smoke script is available:

```powershell
python scripts/test_orchestrator.py
```

It invokes the graph with a sample anti-inflammatory formulation prompt and prints the synthesized report. It requires working model, Supabase, Neo4j, and Chroma configuration.

## 5. Troubleshooting

### API starts but evaluation fails

Check the API logs for missing Groq keys, Neo4j connectivity, or Supabase errors. Confirm the browser is calling port 8000 and that the user has a valid Supabase session token.

### Empty biological results

Run `verify_database_health.py`, inspect table row counts, confirm plant names match the canonical resolver output, and verify foreign-key parent IDs during ingestion.

### Empty legal results

Confirm `backend/data/chroma_db` exists and that both collections were indexed. Re-run `ingest_legal_corpus.py` if the corpus changed.

### Translation returns original text

Bhashini failures intentionally fall back to source text. Check `BHASHINI_INFERENCE_KEY`, source/target codes, network access, and the Dhruva response format.

### No prior-art warning

A missing `SERPAPI_API_KEY`, an empty extracted plant list, a failed request, or zero organic results all produce no warning. This must not be interpreted as proof that no prior art exists.

### Authenticated evaluation returns 401

Check that the frontend Supabase URL/key match the backend Supabase project and that the browser sends the current access token. Check backend logs for JWKS retrieval and token-expiry errors.

## 6. Deployment Notes

The current project is optimized for a local hackathon demonstration. A production deployment should:

- build the frontend and serve it from a controlled origin
- replace hard-coded `http://127.0.0.1:8000` with a Vite environment variable
- restrict FastAPI CORS to known frontend origins
- place secrets in a managed secret store
- use private or network-restricted Supabase/Neo4j/Chroma services as appropriate
- add request IDs, structured logs, timeouts, retries, and circuit breakers
- move synchronous database/API calls out of the async event loop or use async clients
- pin dependency versions and generate a lock/constraints file
- expose real dependency readiness checks on health endpoints
- establish legal corpus versioning, review, and update ownership
- add integration tests against disposable or test instances of Supabase, Neo4j, Chroma, and mock external APIs
- configure Supabase RLS and test cross-user access denial
- store audit records with a real `audit_id` and immutable timestamps

## 7. Suggested CI Pipeline

```mermaid
flowchart LR
    Push[Push or pull request] --> FrontLint[Frontend lint]
    FrontLint --> FrontBuild[Frontend build]
    FrontBuild --> PyCompile[Python compile/import check]
    PyCompile --> Unit[Calculator and validator tests]
    Unit --> Contract[API contract tests]
    Contract --> Integration[Mocked integration tests]
    Integration --> Artifact[Build and publish artifacts]
```

At minimum, CI should run frontend lint/build, Python compilation, deterministic ABS tests, citation validator tests, masking tests, and API schema tests without requiring live credentials.
