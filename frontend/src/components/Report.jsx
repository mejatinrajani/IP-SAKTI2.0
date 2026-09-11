import { motion } from 'framer-motion'
import Animate from './Animate'
import { useNavigate } from 'react-router-dom'

export default function Report({ t }) {
  const navigate = useNavigate()
  return (
    <section className="relative bg-navy-950 border-b border-navy-800 py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage:'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)'}}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label text-saffron-400">Output</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-4 tracking-tight">{t.reportHeading}</h2>
          <div className="divider-line mb-14" />
        </Animate>

        <Animate type="scaleIn" delay={0.15}>
          <div className="max-w-4xl mx-auto border border-navy-700 bg-navy-900 shadow-2xl shadow-black/40">
            {/* Doc header */}
            <div className="bg-white px-8 py-5 flex items-start justify-between border-b border-gray-200">
              <div>
                <div className="text-xl font-bold tracking-tight text-navy-900 mb-0.5">IP-SAKTI <span className="text-saffron-500">2.0</span></div>
                <div className="text-xs text-gray-400 tracking-widest uppercase">{t.reportSub}</div>
              </div>
              <div className="text-right text-xs text-gray-400 space-y-1">
                <div><span className="text-gray-300">{t.reportFields.id}:</span> IPSK-2026-0847</div>
                <div><span className="text-gray-300">{t.reportFields.date}:</span> 11 September 2026</div>
                <div><span className="text-gray-300">{t.reportFields.lang}:</span> English · हिंदी</div>
              </div>
            </div>

            {/* Sections */}
            <div className="divide-y divide-navy-800">
              {t.reportSections.map(([num, en, hi], i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.055, duration: 0.4 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  className="px-8 py-4 flex items-center justify-between transition-colors cursor-default group"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-xs font-black text-navy-700 w-6 flex-shrink-0 group-hover:text-saffron-400 transition-colors">{num}</span>
                    <span className="text-sm font-semibold text-navy-200 group-hover:text-white transition-colors">{en}</span>
                  </div>
                  <span className="text-sm text-navy-600 hidden sm:block group-hover:text-navy-400 transition-colors">{hi}</span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-navy-700 bg-white/5 px-8 py-4 flex items-center justify-between">
              <span className="text-xs text-navy-500">Bhringraj Hair Oil — Regulatory & IPR Evaluation</span>
              <button
                onClick={() => navigate('/evaluate')}
                className="text-xs font-bold text-saffron-400 border border-saffron-700 px-5 py-2 hover:bg-saffron-400 hover:text-navy-900 transition-colors"
              >
                Generate Yours →
              </button>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
