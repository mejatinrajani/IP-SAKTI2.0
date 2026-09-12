# Implementation Status

This document separates verified repository behavior from product intent and identifies the highest-value follow-up work.

## 1. Implemented and Present

| Capability | Evidence in repository | Status |
|---|---|---|
| FastAPI application and modular routers | `backend/main.py` | Implemented |
| React/Vite workspace | `frontend/src/App.jsx`, components, `package.json` | Implemented |
| Supabase auth session management | `frontend/src/context/AuthContext.jsx` | Implemented |
| Authenticated master evaluation | `backend/routers/orchestrator.py` | Implemented |
| Chat persistence, pin, rename, delete, feedback | `App.jsx`, `Sidebar.jsx`, `EvaluatorView.jsx` | Implemented, dependent on Supabase schema/RLS |
| Voice input | Browser Web Speech API in `EvaluatorView.jsx` | Implemented where browser supports it |
| Read-aloud output | Browser Speech Synthesis API | Implemented where browser supports it |
| PDF printing | `react-to-print` in `EvaluatorView.jsx` | Implemented |
| Structured entity extraction | Pydantic + Groq in `core/orchestrator.py` | Implemented, key-dependent |
| Botanical alias resolution | `core/entity_resolver.py` | Implemented with registry and Neo4j fallbacks |
| DMR screening | Supabase list plus LLM and keyword fallback | Implemented, corpus/configuration-dependent |
| Neo4j regulatory traversal | `core/orchestrator.py`, `core/graph_engine.py`, seed script | Implemented in two related paths |
| IMPPAT data access | Supabase queries and ingestion scripts | Implemented, schema/data-dependent |
| Jurisdiction-separated Chroma RAG | `core/vector_store.py`, `core/dual_rag_engine.py` | Implemented |
| Semantic and citation validation | `semantic_validator.py`, `citation_validator.py` | Implemented with fallback behavior |
| SerpApi patent lookup | `core/prior_art.py` | Implemented when key and network are available |
| Audit metrics | `/evaluate` structured auditor and fallback | Implemented |
| Bhashini translation | `core/bhashini_client.py` and active orchestration path | Implemented with source-text fallback |
| Deterministic ABS calculator | `core/abs_calculator.py` and UI | Implemented, legal rates must be verified |
| Innovation evaluation endpoint | `routers/innovation.py` | Implemented, requires additional Supabase tables |
| Legal/biological seed scripts | `backend/scripts` | Implemented as operational utilities |

## 2. Configuration-Dependent

These features exist in code but require external infrastructure or data before they are demonstrable:

- Groq structured calls and report synthesis
- Neo4j full-text index `plant_names_index`
- Neo4j graph database and seeded ontology
- Supabase IMPPAT and DMR tables
- Supabase chats/messages tables and RLS
- Chroma embeddings and indexed legal corpus
- Bhashini inference credentials
- SerpApi live Google Patents results
- browser speech recognition and speech synthesis
- frontend environment values for Supabase

## 3. Partial, Inconsistent, or Requires Hardening

### 3.1 The active UI route is narrower than the architecture

`App.jsx` currently renders the evaluator workspace and ABS calculator components, but it does not wire the landing page through a router or pass all language/view setter props expected by `Sidebar.jsx`. The product documentation should describe the current workspace accurately and treat the landing page as an available component rather than assume it is the active entry screen.

### 3.2 `/evaluate` authentication is not the same as end-to-end authorization

The endpoint verifies a token, but the `user_id` is not passed into the evaluation state or used to authorize a database operation. Frontend chat queries are user-filtered, but Supabase RLS policies are outside this repository. Production authorization must be validated at the database boundary.

### 3.3 The RAG response contract needs repair

`DualRAGResponse` requires `audit_id`, while the RAG engine does not visibly generate one. The translation response model also expects fields that the Bhashini client's internal mock response does not populate. Add contract tests and make every route return its declared Pydantic shape.

### 3.4 Multiple orchestration paths exist

`/api/v1/orchestrate/ask`, `/api/v1/orchestrate/evaluate`, `/api/v1/ip-core/query-dual-rag`, `/api/v1/ip-core/agentic-classify`, and `/api/v1/innovation/evaluate-formulation` overlap in purpose. This is useful for experimentation but increases maintenance and security surface. Define a canonical public API and mark the others as internal or deprecated.

### 3.5 Prior art is a warning, not a full audit

SerpApi returns the first three organic results and the system prepends a warning. It does not conduct claims analysis, family analysis, legal-status verification, FTO analysis, or official TKDL access. The `TKDLProxyEngine` is a small open-proxy simulation and is not the active `/evaluate` prior-art source.

### 3.6 Semantic fallback is permissive

When the semantic LLM grader is unavailable, `SemanticValidator` returns `is_supported=True` with a heuristic message. This preserves availability but weakens the safety claim. A production mode should fail closed or mark the result as unverified.

### 3.7 Legal corpus claims require governance

The repository contains a curated in-code legal corpus and generated Chroma state. It does not yet provide a formal source registry, effective-date policy, amendment workflow, reviewer sign-off, or automated citation freshness check. Those are essential before government or commercial reliance.

### 3.8 Async boundaries need performance review

Several `async` functions call synchronous Supabase, Neo4j, or `requests` clients. Under concurrent load, these can block the event loop. Use async drivers or isolate blocking work in a thread pool.

### 3.9 CORS and local URLs are development settings

FastAPI allows all origins, methods, and headers, and the frontend hard-codes `127.0.0.1:8000`. Both must be environment-driven and restricted for deployment.

## 4. Recommended Next Milestones

### Milestone 1: Make the demo contract reliable

- Add `.env.example` files for backend and frontend.
- Add Supabase migrations for all referenced tables and RLS policies.
- Add deterministic unit tests for ABS tiers, masking, alias resolution, and citation parsing.
- Add API contract tests for `/health`, `/evaluate`, `/calculate-abs`, `/translate`, and direct RAG.
- Generate `audit_id` and make it flow through logs and responses.

### Milestone 2: Make safety claims defensible

- Add source URLs, dates, and provenance to legal corpus records.
- Fail closed or explicitly label unverified output when semantic validation is unavailable.
- Separate “screening signal” from “legal conclusion” in all prior-art copy.
- Add toxicity/clinical-evidence completeness fields to the biological matrix.
- Review statutory rates, forms, and legal prompts with domain experts.

### Milestone 3: Consolidate product architecture

- Select `/evaluate` as the canonical evaluation API.
- Move the prior-art step into the graph or formalize it as a post-graph stage with a documented state contract.
- Remove or label unused/legacy clients and duplicate graph paths.
- Add a configurable `VITE_API_BASE_URL`.
- Wire the intended landing/workspace routing and sidebar controls.

### Milestone 4: Prepare for production

- Replace permissive CORS, placeholder Supabase values, and local persistence assumptions.
- Add observability, rate limiting, request cancellation, retries, and integration health probes.
- Pin dependencies and scan them in CI.
- Add load tests around concurrent evaluations and large reports.
- Establish a review process for corpus updates and model prompt changes.

## 5. Honest Product Readiness Statement

The repository is strong enough to demonstrate the central hackathon thesis: multilingual formulation intake can be routed through an evidence-oriented legal and biological evaluation workflow with a visible dual-jurisdiction result. It is not yet a legally authoritative clearance system or a production-grade multi-tenant service. The next engineering priority is contract consistency, test coverage, data governance, and deployment hardening rather than adding more model features.
