# Features and Differentiation

## 1. Product Story

**IP-SAKTI 2.0** means an intelligent, practical bridge between Indian biological innovation and the legal, scientific, and commercial decisions required to take a botanical formulation forward.

The product is designed for the moment when a researcher, AYUSH manufacturer, startup, university team, patent facilitator, or policy professional asks:

> “I have this plant, this formulation, and this intended claim. What can I legally say, what approvals do I need, what data supports it, what prior art already exists, and what will it cost?”

Most generic assistants answer one part of that question from a broad language model. IP-SAKTI 2.0 assembles a decision dossier from multiple evidence systems and separates India-specific obligations from export considerations.

## 2. Feature Inventory

### 2.1 Conversational regulatory entry point

Users can write natural-language formulation descriptions instead of completing a rigid legal form first. The gatekeeper recognizes simple greetings and vague requests, responds quickly, and asks for missing formulation facts when an evaluation would be premature.

### 2.2 Structured botanical entity extraction

The evaluation graph extracts botanical entities, therapeutic claims, and intended-use type into Pydantic-validated fields. This provides a stable state contract between LLM reasoning and downstream database queries.

### 2.3 Vernacular and Ayurvedic name resolution

`EntityResolver` maps common, vernacular, Sanskrit, and Ayurvedic names to canonical Latin binomials. Examples include:

- bhang, ganja, hemp, and vijaya to `Cannabis sativa`
- tulsi to `Ocimum sanctum`
- haldi and haridra to `Curcuma longa`
- giloy and guduchi to `Tinospora cordifolia`

The resolver then attempts Neo4j full-text fuzzy matching and substring fallback for names outside the static registry.

### 2.4 DMR Act claim screening

The DMR stage checks therapeutic claims against a database-backed prohibited-disease list and instructs the evaluator to handle explicit synonym mappings. This is designed to catch risky curative, preventive, diagnostic, or treatment claims before they are treated as ordinary product copy.

### 2.5 Regulatory graph pathways

Neo4j connects plant resources, statutory acts, authorities, and forms. The current seed ontology includes Ministry of Ayush, CDSCO, NBA, the Drugs and Cosmetics Act, the Biological Diversity Act, Forms 24D/25D, and Forms 8/9. Traversal can distinguish patent/IP intent from commercial utilization intent.

### 2.6 IMPPAT biological intelligence

The Supabase matrix connects:

- phytochemical identity and identifiers
- plant-part associations
- traditional therapeutic uses
- human target proteins
- ADMET properties
- Lipinski status, molecular weight, LogP, TPSA, bioavailability, GI absorption, and BBB fields

This turns a purely legal answer into an evidence-aware formulation assessment.

### 2.7 Jurisdiction-isolated statutory RAG

India and international material are stored in separate Chroma collections. A report can therefore produce an India dossier and an international export dossier without treating a foreign rule as an Indian requirement or vice versa.

### 2.8 Dual-jurisdiction synthesis

The standard evaluation prompt asks for:

**National report:** India-specific AYUSH, CDSCO, Biological Diversity Act, DMR, Schedule E(1), and action requirements.

**International report:** US FDA/DSHEA context, European THMPD context, global labeling, substantiation, and export directives.

### 2.9 Prior-art warning layer

Canonical ingredients and claims can be searched against Google Patents through SerpApi. Up to three result records are formatted into a warning that is prepended to both dossiers, including a reminder that freedom-to-operate review is required.

This is a screening signal, not a patent validity opinion or a substitute for a professional search.

### 2.10 XAI audit metrics

The report includes an audit panel with:

- statutory faithfulness/groundedness score
- data completeness status
- system confidence level
- active verification sources

The metrics give a reviewer a quick way to see whether the answer was supported by graph, biological, patent, and statutory sources.

### 2.11 DPDP-oriented quantity masking

The masker replaces quantities such as `40%`, `500mg`, and `2ml` with temporary redaction tokens before selected model/RAG calls, then restores the original values. This limits exposure of formulation ratios in those paths while preserving readable output.

### 2.12 Multilingual and voice interaction

The browser supports speech recognition for English and Hindi locales, while the backend supports Bhashini translation codes for all 22 Scheduled Indian Languages. The workspace can translate the query before processing and translate reports back after synthesis.

### 2.13 Regulatory Canvas

The report opens in a dedicated canvas with:

- National and International tabs
- Markdown rendering and tables
- audit and traceability panel
- copy action
- browser read-aloud
- PDF print/download

### 2.14 Deterministic ABS liability calculator

The ABS calculator does not ask an LLM to estimate a fee. It applies explicit commercial turnover tiers, IPR licensing bands, and the registered AYUSH practitioner exemption implemented in `ABSCalculator`. It also presents statutory reality checks such as gross ex-factory sales treatment and Form 9 timing.

### 2.15 Authenticated workspaces and feedback

Supabase Auth supports sign-in, sign-up, email OTP verification, and sign-out. Signed-in users can create chats, rename or pin them, delete them, reload messages, and submit thumbs-up/thumbs-down feedback.

## 3. Why IP-SAKTI Stands Out

### 3.1 It is a workflow, not a chatbot

The product’s main innovation is orchestration. A prompt moves through specialized evidence and decision stages instead of being answered by one unconstrained generation call. The pipeline makes entity extraction, prohibited-claim screening, graph pathways, biological context, statutory grounding, prior art, and auditing visible as distinct responsibilities.

### 3.2 It joins legal, scientific, and commercial context

A patent or compliance answer without formulation evidence is incomplete. A phytochemical table without regulatory implications is difficult to act on. IP-SAKTI joins those views in one dossier so a team can see the legal risk, the available scientific evidence, and the next action together.

### 3.3 It is India-first without being India-only

The platform starts with AYUSH, Indian biodiversity governance, Indian patent/traditional-knowledge concerns, and DMR claim restrictions. It then adds a separate export view for US and EU considerations. This matches how Indian botanical products actually move from local development to global commercialization.

### 3.4 It respects traditional knowledge as a patentability issue

The combination of canonical plant resolution, classical-use lookup, Section 3(p)-oriented assessment, IMPPAT evidence, and patent cross-referencing helps users identify traditional-knowledge and novelty problems early rather than after an expensive filing or launch.

### 3.5 It is multilingual at the reasoning boundary

Regional language support is not only a UI translation. The system translates into an internal processing language before structured extraction and translates the dossier back afterward, making the main workflow more accessible to users who describe traditional formulations in an Indian language.

### 3.6 It makes uncertainty visible

The product exposes abstentions, confidence, completeness, source lists, DMR flags, and prior-art warnings. That is more useful in a regulated setting than a polished answer that hides missing toxicity, unavailable corpus evidence, or failed integrations.

### 3.7 It separates deterministic calculations from generative reasoning

ABS fees, disease-list loading, alias resolution, citation pattern checks, and database joins are implemented as code or structured retrieval. LLMs are used for language-heavy tasks such as extraction, claim interpretation, synthesis, and audit. This division makes the system easier to explain and test.

## 4. Target Users

| User | Problem solved |
|---|---|
| AYUSH researcher | Understands claim restrictions, biological evidence, and required next steps |
| Startup or formulation team | Screens regulatory category, prior art, and ABS exposure before investment |
| Patent facilitator | Gets a structured starting dossier for novelty, traditional knowledge, and statutory bars |
| Government or institutional reviewer | Reviews India and export dimensions with traceable source signals |
| University or incubator | Teaches responsible translation of botanical research into compliant products |
| Small manufacturer | Receives an accessible multilingual explanation rather than scattered legal references |

## 5. Suggested Hackathon Demonstration

1. Open the workspace and show the IP-SAKTI logo and authenticated chat experience.
2. Ask a vague question to demonstrate fast gatekeeping and clarification.
3. Submit a prompt containing a vernacular plant name and a prohibited disease claim.
4. Show canonical entity resolution, DMR violation flag, and the two report tabs.
5. Open the audit panel and explain the evidence sources.
6. Use the ABS calculator with a commercial turnover and then with an IPR licensing fee/royalty.
7. Switch language, use voice input, and show translated delivery.
8. Explain the prior-art alert as an early warning that escalates to professional FTO review.

## 6. Responsible Positioning

The strongest claim for the product is:

> IP-SAKTI 2.0 is a multilingual, evidence-oriented regulatory intelligence assistant that helps Indian botanical innovators identify legal pathways, statutory claim risks, biological evidence, prior-art signals, and ABS exposure before professional filing or commercialization decisions.

Avoid claiming that the platform grants legal clearance, proves patentability, replaces government review, or produces definitive medical advice. Those claims would exceed the current implementation and the appropriate role of an AI decision-support system.
