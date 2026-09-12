import { motion } from 'framer-motion'
import Animate from './Animate'

const nodeColors = [
  'border-blue-200 bg-blue-50 text-blue-800',
  'border-purple-200 bg-purple-50 text-purple-800',
  'border-green-200 bg-green-50 text-green-800',
  'border-orange-200 bg-orange-50 text-orange-800',
  'border-teal-200 bg-teal-50 text-teal-800',
  'border-rose-200 bg-rose-50 text-rose-800',
]

export default function USP({ t }) {
  return (
    <section className="relative bg-white border-b border-gray-100 py-28 overflow-hidden">
      {/* Dot grid bg */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-saffron-400/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Animate type="fadeUp">
          <span className="section-label">Platform Architecture</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mt-4 mb-4 leading-tight tracking-tight">
            {t.uspHeading}
          </h2>
          <div className="divider-line mx-auto mb-16" />
        </Animate>

        <Animate type="scaleIn" delay={0.15}>
          <div className="max-w-2xl mx-auto">
            {/* Input node */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-3 bg-navy-900 text-white px-10 py-4 shadow-xl shadow-navy-900/30 mb-2"
            >
              <div className="w-2 h-2 rounded-full bg-saffron-400" />
              <span className="text-sm font-bold tracking-widest uppercase">{t.uspCenter}</span>
              <div className="w-2 h-2 rounded-full bg-saffron-400" />
            </motion.div>

            {/* Connecting lines to grid */}
            <div className="flex justify-center mb-2">
              <svg width="300" height="24" viewBox="0 0 300 24" className="opacity-30">
                {[0,1,2,3,4,5].map(i => (
                  <line key={i} x1={25 + i*50} y1="0" x2={25 + i*50} y2="24" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3"/>
                ))}
                <line x1="0" y1="0" x2="300" y2="0" stroke="#64748b" strokeWidth="1"/>
              </svg>
            </div>

            {/* Intelligence layers */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
              {t.uspNodes.map((node, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, duration: 0.5 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                  className={`border-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-default transition-all ${nodeColors[i]}`}
                >
                  {node}
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center my-3">
              <svg width="300" height="24" viewBox="0 0 300 24" className="opacity-30">
                <line x1="0" y1="24" x2="300" y2="24" stroke="#64748b" strokeWidth="1"/>
                {[0,1,2,3,4,5].map(i => (
                  <line key={i} x1={25+i*50} y1="0" x2={25+i*50} y2="24" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3"/>
                ))}
              </svg>
            </div>
            <div className="flex justify-center mb-3">
              <svg className="w-5 h-5 text-saffron-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Output */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-3 border-2 border-saffron-500 bg-saffron-50 text-saffron-800 px-10 py-4 shadow-lg shadow-saffron-100"
            >
              <div className="w-2 h-2 rounded-full bg-saffron-500" />
              <span className="text-sm font-bold tracking-widest uppercase">{t.uspOutput}</span>
            </motion.div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
