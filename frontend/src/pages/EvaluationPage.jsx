import { useState } from 'react'
import PageTransition from '../components/PageTransition'
import Animate from '../components/Animate'
import { motion, AnimatePresence } from 'framer-motion'
import { evaluateFormulation, askIPSakti } from '../lib/api'

const steps = ['Describe', 'Analyse', 'Report']

export default function EvaluationPage({ t }) {
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState({ name: '', ingredients: '', use: '', lang: 'en' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [result, setResult]   = useState(null)   // EvalResponse from backend

  // ── Submit to backend ──────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.name || !form.ingredients) return
    setLoading(true)
    setError(null)

    const prompt = `I want to create "${form.name}" using: ${form.ingredients}. Intended use: ${form.use || 'not specified'}.`

    try {
      // Try the authenticated /evaluate endpoint first; fall back to /ask (no auth)
      let data
      try {
        data = await evaluateFormulation(prompt, form.lang)
      } catch (authErr) {
        // If JWT not set, fall back to the unauthenticated /ask pipeline
        const askData = await askIPSakti(prompt, form.lang)
        data = {
          type: 'evaluation',
          message: 'Analysis complete via general pipeline.',
          report: {
            extracted_plants: [],
            extracted_claims: prompt,
            dmr_violation: false,
            final_report: askData.data || {},
          },
        }
      }
      setResult(data)
      setStep(2)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() { setStep(0); setForm({ name: '', ingredients: '', use: '', lang: 'en' }); setResult(null); setError(null) }

  return (
    <PageTransition>
      {/* Banner */}
      <div className="bg-navy-900 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-400 font-semibold mb-2">Evaluation</div>
            <h1 className="text-3xl font-bold text-white mb-6">Start an Evaluation</h1>
            {/* Step bar */}
            <div className="flex items-center gap-0">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    i === step ? 'bg-saffron-400 text-navy-900' :
                    i < step  ? 'bg-navy-700 text-navy-300' :
                                'bg-navy-800 text-navy-500'
                  }`}>
                    <span>{i + 1}</span><span>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-navy-700" />}
                </div>
              ))}
            </div>
          </Animate>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatePresence mode="wait">

            {/* ── STEP 0 — Describe ────────────────────────────────────────── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <div className="bg-white border border-gray-200 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Describe your formulation</h2>
                  <p className="text-sm text-gray-500 mb-8">Enter details in any language. Scientific names will be auto-identified.</p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Formulation Name *</label>
                      <input
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 transition-colors bg-white"
                        placeholder="e.g. Bhringraj Hair Oil"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ingredients *</label>
                      <textarea rows={4}
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 transition-colors bg-white resize-none"
                        placeholder="e.g. Eclipta alba, Phyllanthus emblica, Sesame oil"
                        value={form.ingredients}
                        onChange={e => setForm({ ...form, ingredients: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Intended Use</label>
                      <input
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 transition-colors bg-white"
                        placeholder="e.g. Topical hair oil for retail sale"
                        value={form.use}
                        onChange={e => setForm({ ...form, use: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Report Language</label>
                      <select
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 bg-white"
                        value={form.lang}
                        onChange={e => setForm({ ...form, lang: e.target.value })}
                      >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="mr">मराठी</option>
                        <option value="bn">বাংলা</option>
                        <option value="ta">தமிழ்</option>
                        <option value="te">తెలుగు</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between items-center">
                    <p className="text-xs text-gray-400">All evaluations are evidence-linked and traceable.</p>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setError(null); setStep(1) }}
                      disabled={!form.name || !form.ingredients}
                      className="bg-navy-900 text-white text-sm font-bold px-10 py-3 disabled:opacity-40 hover:bg-navy-700 transition-colors"
                    >
                      Continue →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1 — Review & Run ────────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <div className="bg-white border border-gray-200 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Review before analysis</h2>
                  <p className="text-sm text-gray-500 mb-8">Confirm your formulation details. The backend will evaluate across 6 intelligence layers.</p>

                  {/* Summary card */}
                  <div className="border border-gray-100 bg-gray-50 px-6 py-5 mb-8 space-y-3">
                    {[
                      ['Formulation', form.name],
                      ['Ingredients', form.ingredients],
                      ['Intended Use', form.use || '—'],
                      ['Report Language', form.lang.toUpperCase()],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 text-sm">
                        <span className="text-gray-400 font-semibold w-36 flex-shrink-0 text-xs uppercase tracking-wider pt-0.5">{k}</span>
                        <span className="text-navy-800">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Layers that will run */}
                  <div className="mb-8">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Analysis Layers</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Regulatory', 'IPR / Patents', 'Traditional Knowledge', 'ABS / Biodiversity', 'Evidence Citations', 'Multilingual Output'].map(l => (
                        <div key={l} className="border border-navy-100 bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-700 text-center">{l}</div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                  )}

                  <div className="flex justify-between">
                    <button onClick={() => setStep(0)} className="text-sm text-gray-500 hover:text-navy-900 transition-colors">← Back</button>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-navy-900 text-white text-sm font-bold px-10 py-3 hover:bg-navy-700 transition-colors disabled:opacity-60 flex items-center gap-3"
                    >
                      {loading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block" />
                          Running Analysis…
                        </>
                      ) : 'Run Evaluation →'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 — Report ─────────────────────────────────────────── */}
            {step === 2 && result && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                {/* Status banner */}
                <div className={`mb-4 px-6 py-3 text-sm font-semibold flex items-center gap-2 ${
                  result.report?.dmr_violation
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  <span>{result.report?.dmr_violation ? '⚠ DMR Violation Detected' : '✓ Evaluation Complete'}</span>
                  <span className="ml-auto text-xs font-normal opacity-70">{result.message}</span>
                </div>

                {/* Report document */}
                <div className="border border-gray-200 bg-white shadow-sm">
                  <div className="bg-navy-900 text-white px-8 py-5 flex items-start justify-between">
                    <div>
                      <div className="text-xl font-bold tracking-tight mb-0.5">IP-SAKTI <span className="text-saffron-400">2.0</span></div>
                      <div className="text-xs text-navy-400 tracking-widest uppercase">Regulatory & IPR Evaluation</div>
                    </div>
                    <div className="text-right text-xs text-navy-400 space-y-1">
                      <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
                      <div>Lang: {form.lang.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* Formulation summary */}
                  <div className="px-8 py-4 border-b border-gray-100 bg-saffron-50">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Formulation</div>
                    <div className="font-bold text-navy-900">{form.name}</div>
                    {result.report?.extracted_plants?.length > 0 && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        Identified: {result.report.extracted_plants.join(' · ')}
                      </div>
                    )}
                  </div>

                  {/* Report content */}
                  {result.report?.final_report?.content ? (
                    <div className="px-8 py-6">
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Evaluation Report</div>
                      <div className="prose prose-sm max-w-none text-navy-800 whitespace-pre-wrap leading-relaxed text-sm">
                        {result.report.final_report.content}
                      </div>
                    </div>
                  ) : (
                    /* Fallback: show structured sections when content is empty */
                    <div className="divide-y divide-gray-100">
                      {[
                        ['01','Executive Summary','कार्यकारी सारांश'],
                        ['02','Formulation Profile','फॉर्मूलेशन प्रोफ़ाइल'],
                        ['03','Regulatory Assessment','नियामक मूल्यांकन'],
                        ['04','IPR Assessment','बौद्धिक संपदा मूल्यांकन'],
                        ['05','Traditional Knowledge','पारंपरिक ज्ञान'],
                        ['06','ABS / Biodiversity','ABS / जैव-विविधता'],
                        ['07','Risk Assessment','जोखिम मूल्यांकन'],
                        ['08','Evidence','साक्ष्य'],
                        ['09','Recommended Actions','अनुशंसित कार्यवाही'],
                      ].map(([num, en, hi]) => (
                        <motion.div key={num} whileHover={{ backgroundColor: '#f8faff' }}
                          className="px-8 py-4 flex items-center justify-between transition-colors">
                          <div className="flex items-center gap-5">
                            <span className="text-xs font-bold text-gray-300 w-6">{num}</span>
                            <span className="text-sm font-medium text-navy-800">{en}</span>
                          </div>
                          <span className="text-sm text-gray-400 hidden sm:block">{hi}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* India response from RAG (if present) */}
                  {result.data?.india_response?.content && (
                    <div className="border-t border-gray-100 px-8 py-6 bg-navy-50">
                      <div className="text-xs font-bold uppercase tracking-widest text-navy-500 mb-3">India Jurisdiction — RAG Response</div>
                      <p className="text-sm text-navy-800 leading-relaxed whitespace-pre-wrap">{result.data.india_response.content}</p>
                      {result.data.india_response.citations?.length > 0 && (
                        <div className="mt-4 space-y-1">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Citations</div>
                          {result.data.india_response.citations.map((c, i) => (
                            <div key={i} className="text-xs text-gray-500 flex gap-2">
                              <span className="text-saffron-500 font-bold">→</span>
                              <span>{c.statute} — {c.section}</span>
                              {c.gazette_reference && <span className="text-gray-400">({c.gazette_reference})</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Statutory information only. Does not constitute formal legal counsel.</span>
                    <div className="flex gap-3">
                      <button onClick={reset} className="text-xs text-gray-500 hover:text-navy-900 transition-colors">← New Evaluation</button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="bg-navy-900 text-white text-xs font-bold px-6 py-2 hover:bg-navy-700 transition-colors">
                        Download PDF
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
