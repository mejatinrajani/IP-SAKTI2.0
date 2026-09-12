# API and Contracts

All routes are registered by `backend/main.py`. The examples below use `http://127.0.0.1:8000`.

## Authentication

`POST /api/v1/orchestrate/evaluate` depends on `verify_supabase_jwt`. The client sends:

```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

The verifier fetches the Supabase JWKS endpoint, validates the token signature, disables audience verification, and returns the JWT subject. A missing or invalid subject produces HTTP 401. The remaining routes currently do not consistently depend on this verifier; see [Implementation Status](IMPLEMENTATION_STATUS.md).

## System

### `GET /health`

Returns a lightweight health payload:

```json
{
  "status": "HEALTHY",
  "engine": "IP-SAKTI 2.0",
  "jurisdiction_isolation": "ACTIVE",
  "citation_validator_rules": 56
}
```

This endpoint is a process-level health response. It does not prove that Supabase, Neo4j, Chroma, Groq, Bhashini, or SerpApi are reachable.

## Master Orchestration

### `POST /api/v1/orchestrate/evaluate`

Primary frontend endpoint. Authenticated.

Request:

```json
{
  "user_prompt": "I want to develop a turmeric formulation for joint pain.",
  "user_language": "en"
}
```

Response type `chat`:

```json
{
  "type": "chat",
  "message": "Please provide your specific ingredients and intended claims.",
  "report": null
}
```

Response type `evaluation`:

```json
{
  "type": "evaluation",
  "message": "Evaluation complete. Extracted 1 botanical entities...",
  "report": {
    "extracted_plants": ["Curcuma longa"],
    "extracted_claims": "joint pain",
    "dmr_violation": false,
    "final_report": {
      "status": "success",
      "content": "...",
      "national_content": "...",
      "international_content": "...",
      "dmr_violation": false,
      "prohibited_disease": null
    },
    "audit_metrics": {
      "groundedness_score": 95,
      "completeness": "Partial (Toxicity Data Pending)",
      "confidence": "Moderate",
      "sources": ["Neo4j (Regulatory Ontology)", "Supabase (Biological Matrix)"]
    }
  }
}
```

Execution stages:

1. Translate to English when `user_language` is not `en`.
2. Classify `chat` versus `evaluation` with a structured Groq call.
3. For evaluation, invoke the LangGraph application.
4. Search Google Patents through SerpApi.
5. Add prior-art warnings to report content when results exist.
6. Translate dossiers and summary back to the requested language.
7. Run the XAI auditor and return the report.

### `POST /api/v1/orchestrate/ask`

General IP/RAG pipeline. Request:

```json
{
  "user_input": "What approval pathway applies to a botanical patent?",
  "user_language": "en"
}
```

This route translates, invokes the agentic formulation classifier, traverses the legal graph, masks quantities, runs dual RAG, unmasks output, and optionally translates it back. It returns an `OrchestratorResponse` with `status` and `data`.

## IP Core

### `POST /api/v1/ip-core/agentic-classify`

Request body uses an embedded string:

```json
{ "user_input": "This is a modified ashwagandha extract for internal use." }
```

Possible responses:

```json
{ "status": "pending_clarification", "message": "..." }
```

or:

```json
{
  "status": "classified",
  "data": {
    "category": "Phytopharmaceutical Drug",
    "regulatory_act": "New Drugs and Clinical Trials (NDCT) Rules, 2019...",
    "licensing_form": "Form CT-18 (CDSCO New Drug Division)",
    "patentability_verdict": "...",
    "statutory_bars": [],
    "abs_applicable": true,
    "recommended_ip": []
  }
}
```

The agentic wizard extracts classical status, purified-extract status, intended use, and Indian biological-resource use. It asks for clarification when required values remain unknown.

### `POST /api/v1/ip-core/query-dual-rag`

Request:

```json
{
  "query": "What does Section 3(p) mean for neem prior art?",
  "jurisdiction": "Dual",
  "classification": null,
  "language": "en"
}
```

`jurisdiction` is one of `India`, `International`, or `Dual`.

The response follows `DualRAGResponse`:

```json
{
  "query": "...",
  "india_response": {
    "jurisdiction": "India",
    "content": "...",
    "citations": [
      {
        "statute": "Patents Act, 1970",
        "section": "3(p)",
        "gazette_reference": null,
        "verified_in_context": true,
        "raw_tag": "[CIT: Patents Act, 1970, Sec 3(p)]"
      }
    ],
    "confidence_score": 0.98,
    "is_abstained": false,
    "abstention_reason": null
  },
  "international_response": null,
  "audit_id": "implementation-defined",
  "timestamp": "2026-01-01T00:00:00",
  "disclaimer": "Statutory information only..."
}
```

The current schema requires `audit_id`, but the RAG engine does not visibly assign it in `DualRAGResponse`; this should be resolved before treating this route as a stable external contract.

## Compliance

### `POST /api/v1/compliance/calculate-abs`

Request:

```json
{
  "applicant_type": "commercial_entity",
  "purpose": "commercial_utilization",
  "gross_annual_sales_inr": 45000000,
  "upfront_licensing_fee_inr": 0,
  "annual_royalty_inr": 0
}
```

Supported applicant types in the current calculator:

- `commercial_entity`
- `registered_ayush_practitioner`

Supported purposes:

- `commercial_utilization`
- `ipr_licensing`

Response:

```json
{
  "is_exempt": false,
  "exemption_reason": null,
  "calculated_abs_fee_inr": 225000.0,
  "calculated_max_fee_inr": 225000.0,
  "applied_rate_description": "0.5% on Gross Ex-Factory Sales (Turnover > ₹3 Crores)",
  "statutory_reality_check": ["...", "..."]
}
```

The calculator uses `Decimal` internally and rounds to two decimal places. Registered AYUSH practitioners receive the implemented statutory-exemption response. Commercial sales use three turnover tiers; IPR licensing returns a minimum/maximum range based on upfront fee and annual royalty.

## Innovation

### `POST /api/v1/innovation/evaluate-formulation`

Request:

```json
{
  "plant_names": ["Azadirachta indica", "Curcuma longa"],
  "claimed_use": "topical cleansing"
}
```

Response fields:

- `is_novel`
- `magic_remedies_violation`
- `dmr_warning`
- `classical_prior_art`
- `documented_traditional_uses`
- `active_phytochemicals`
- `patentability_assessment`
- `regulatory_citations`

This route reads the DMR disease table, IMPPAT therapeutic and plant data, classical formulation relationships, phytochemical associations, and ADMET properties. It is separate from the main `/evaluate` route.

## Language

### `POST /api/v1/language/translate`

Request:

```json
{
  "source_text": "Translate this statutory explanation.",
  "source_lang": "en",
  "target_lang": "hi"
}
```

The intended response is `TranslationResponse` with original text, translated text, source language, target language, and fallback status. The current Bhashini client returns a lightweight mock object containing only `translated_text` for internal callers, so this route requires contract testing before public use.

## Error Behavior

- Most router exceptions become HTTP 500 with a module-specific message.
- Translation failures at the internal orchestration level fall back to original text.
- Missing prior-art credentials result in an empty result rather than a request failure.
- Missing or unavailable biological/statutory results generally produce empty context and lower-confidence or abstained output.
- The frontend displays a generic “Evaluation failed” message when the evaluation fetch fails.
