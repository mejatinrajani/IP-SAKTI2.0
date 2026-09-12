import { motion } from 'framer-motion'
import Animate from '../Animate'

const manualSteps = [
  { step: 'Identify applicable statutes', time: '2–4 hours' },
  { step: 'Search TKDL for prior art', time: '1–2 days' },
  { step: 'Consult biodiversity regulations', time: '1 day' },
  { step: 'Cross-reference pharmacopoeia', time: '3–6 hours' },
  { step: 'Draft compliance report', time: '1–2 days' },
]

const metrics = [
  { value: '<60s', label: 'Average evaluation time' },
  { value: '56', label: 'Regulatory rules checked' },
  { value: '9', label: 'Report sections generated' },
  { value: '6+', label: 'Languages supported' },
]

export default function ProofSection() {
  return (
    <section className="relative bg-white py-20 lg:py-28 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <Animate type="fadeUp">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-saffron-500 mb-4 block">
              Performance
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight mb-5">
              One formulation. Nine regulatory dimensions. Under 60 seconds.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              What takes a team of consultants 3–5 business days, IP-SAKTI's agentic pipeline delivers in a single conversation turn.
            </p>
          </div>
        </Animate>

        {/* Before/After comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Manual workflow */}
          <Animate type="fadeLeft" delay={0.1}>
            <div className="border border-gray-200 bg-white p-6 lg:p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">Manual Workflow</span>
              </div>
              <div className="space-y-0">
                {manualSteps.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-5">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-gray-700">{s.step}</span>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 border border-red-100">{s.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-bold text-navy-900">3–5 days</span>
              </div>
            </div>
          </Animate>

          {/* IP-SAKTI workflow */}
          <Animate type="fadeRight" delay={0.2}>
            <div className="border border-saffron-200 bg-gradient-to-br from-saffron-50/50 to-white p-6 lg:p-8 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-saffron-400 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-saffron-500" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-saffron-600">IP-SAKTI 2.0</span>
              </div>

              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-6xl lg:text-7xl font-bold text-navy-900 mb-2">&lt;60<span className="text-2xl text-gray-400">s</span></div>
                <p className="text-sm text-gray-500 mb-8">From formulation input to complete regulatory dossier</p>

                {/* Animated pipeline */}
                <div className="w-full max-w-sm space-y-2">
                  {['Classify', 'Analyze', 'Cross-reference', 'Evaluate', 'Generate Report'].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ width: 0, opacity: 0 }}
                      whileInView={{ width: '100%', opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-1.5 bg-gradient-to-r from-saffron-400 to-saffron-200 flex-1" />
                      <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wider whitespace-nowrap">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-saffron-200 flex items-center justify-between">
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider">Automated · AI-Powered · Instant</span>
              </div>
            </div>
          </Animate>
        </div>

        {/* Metric callouts */}
        <Animate type="fadeUp" delay={0.2}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="border border-gray-200 bg-white p-6 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-navy-900 mb-2">{m.value}</div>
                <div className="text-xs text-gray-400 tracking-wide">{m.label}</div>
              </div>
            ))}
          </div>
        </Animate>
      </div>
    </section>
  )
}
