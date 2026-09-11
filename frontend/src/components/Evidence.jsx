import { motion } from 'framer-motion'
import Animate from './Animate'
import { useNavigate } from 'react-router-dom'

export default function Evidence({ t }) {
  const navigate = useNavigate()
  return (
    <section className="relative bg-gray-50 border-b border-gray-200 py-24 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-saffron-400 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label">Evidence Layer</span>
          <h2 className="text-4xl font-bold text-navy-900 mt-4 mb-4 tracking-tight">{t.evidHeading}</h2>
          <div className="divider-line mb-14" />
        </Animate>

        <Animate type="scaleIn" delay={0.1}>
          <div className="max-w-2xl mx-auto border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
            {/* Header */}
            <div className="bg-navy-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-saffron-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-white">{t.evidLabel}</span>
              </div>
              <span className="text-xs text-navy-400 italic">Bhringraj Hair Oil</span>
            </div>

            {/* Body */}
            <div className="px-7 py-6 border-b border-gray-100">
              <div className="text-lg font-bold text-navy-900 mb-5">{t.evidTitle}</div>
              <div className="space-y-4">
                {[
                  { key: 'Basis', val: t.evidBasis },
                  { key: 'Source', val: t.evidSource },
                  { key: 'Ingredients', val: null },
                ].map(({ key, val }, i) => (
                  <div key={i} className="flex gap-6 text-sm items-start">
                    <span className="text-gray-400 font-semibold w-28 flex-shrink-0 text-xs uppercase tracking-wider pt-0.5">{key}</span>
                    {i === 2
                      ? <span className="text-navy-800 italic font-medium">Eclipta alba · Phyllanthus emblica</span>
                      : <span className="text-navy-800">{val}</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            <div className="px-7 py-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Source verified
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/evidence')}
                className="text-sm font-bold text-white bg-navy-900 border border-navy-900 px-6 py-2 hover:bg-navy-700 transition-colors"
              >
                {t.evidCta} →
              </motion.button>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
