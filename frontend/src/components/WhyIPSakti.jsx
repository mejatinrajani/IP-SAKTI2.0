import { motion } from 'framer-motion'
import Animate from './Animate'

export default function WhyIPSakti({ t }) {
  return (
    <section className="relative bg-gray-50 border-b border-gray-200 py-24 overflow-hidden">
      <div className="absolute inset-0 stripe-bg pointer-events-none opacity-60" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label">Comparison</span>
          <h2 className="text-4xl font-bold text-navy-900 mt-4 mb-4 tracking-tight">{t.whyHeading}</h2>
          <div className="divider-line mb-14" />
        </Animate>

        <Animate type="scaleIn" delay={0.1}>
          <div className="max-w-3xl mx-auto shadow-xl shadow-gray-200/60 border border-gray-200 bg-white overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-2">
              <div className="px-8 py-5 border-r border-gray-200 bg-gray-50">
                <span className="text-xs font-black tracking-widest uppercase text-gray-400">{t.whyOldLabel}</span>
              </div>
              <div className="px-8 py-5 bg-navy-900">
                <span className="text-xs font-black tracking-widest uppercase text-saffron-400">{t.whyNewLabel}</span>
              </div>
            </div>

            {t.whyOld.map((old, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`grid grid-cols-2 ${i < t.whyOld.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="px-8 py-4 border-r border-gray-100 flex items-center gap-3 bg-white group">
                  <span className="text-gray-200 font-bold text-lg leading-none">✗</span>
                  <span className="text-sm text-gray-400 line-through decoration-gray-300">{old}</span>
                </div>
                <div className="px-8 py-4 bg-navy-50 flex items-center gap-3">
                  <span className="text-saffron-500 font-bold text-base leading-none">✓</span>
                  <span className="text-sm font-semibold text-navy-800">{t.whyNew[i]}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Animate>
      </div>
    </section>
  )
}
