// ── Base URL from .env ──────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Auth token (set after Supabase login) ───────────────────────────────────
let _token = null
export const setAuthToken = (t) => { _token = t }
export const getAuthToken = () => _token

// ── Generic request helper ──────────────────────────────────────────────────
async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

// ── Health ───────────────────────────────────────────────────────────────────
export const checkHealth = () => request('/health')

// ── Master pipeline (no auth required) ──────────────────────────────────────
// Used in the Demo section on homepage
export const askIPSakti = (user_input, user_language = 'en') =>
  request('/api/v1/orchestrate/ask', {
    method: 'POST',
    body: JSON.stringify({ user_input, user_language }),
  })

// ── Statutory Evaluation (requires JWT) ─────────────────────────────────────
// Used in EvaluationPage
export const evaluateFormulation = (user_prompt, user_language = 'en') =>
  request('/api/v1/orchestrate/evaluate', {
    method: 'POST',
    body: JSON.stringify({ user_prompt, user_language }),
  })

// ── Translate ────────────────────────────────────────────────────────────────
export const translateText = (source_text, source_lang, target_lang) =>
  request('/api/v1/language/translate', {
    method: 'POST',
    body: JSON.stringify({ source_text, source_lang, target_lang }),
  })

// ── ABS Calculator ───────────────────────────────────────────────────────────
export const calculateABS = (payload) =>
  request('/api/v1/compliance/calculate-abs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// ── Dual RAG Query ────────────────────────────────────────────────────────────
export const queryRAG = (query, jurisdiction = 'Dual') =>
  request('/api/v1/ip-core/query-dual-rag', {
    method: 'POST',
    body: JSON.stringify({ query, jurisdiction }),
  })

// ── Backend-assisted signup (auto-confirms email via service_role) ─────────
export const backendSignUp = (email, password) =>
  request('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
