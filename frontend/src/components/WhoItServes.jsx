import { motion } from 'framer-motion'
import Animate from './Animate'

const icons = ['🔬', '🧪', '⚖️', '📋', '🏛️', '💡']

export default function WhoItServes({ t }) {
  return (
    <section className="relative bg-white border-b border-gray-100 py-24 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label">Audience</span>
          <h2 className="text-4xl font-bold text-navy-900 mt-4 mb-4 tracking-tight">{t.whoHeading}</h2>
          <div className="divider-line mb-14" />
        </Animate>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {t.whoItems.map((item, i) => (
            <Animate key={i} type="fadeUp" delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -6, borderColor: '#ff9a2d', boxShadow: '0 12px 32px rgba(10,24,48,0.10)' }}
                className="border border-gray-200 bg-white px-4 py-6 text-center transition-all cursor-default group"
              >
                <div className="text-2xl mb-3">{icons[i]}</div>
                <div className="text-xs font-semibold text-navy-800 leading-snug group-hover:text-navy-900">{item}</div>
              </motion.div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  )
}
