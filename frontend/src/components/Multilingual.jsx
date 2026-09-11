import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Animate from './Animate'

export default function Multilingual({ t }) {
  const [active, setActive] = useState(0)

  return (
    <section className="relative bg-navy-950 border-b border-navy-800 py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage:'repeating-linear-gradient(-45deg,#fff 0,#fff 1px,transparent 1px,transparent 20px)'}}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label text-saffron-400">Language Support</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-4 tracking-tight">{t.mlHeading}</h2>
          <div className="divider-line mb-5" />
          <p className="text-navy-300 max-w-2xl mb-12 leading-relaxed">{t.mlPara}</p>
        </Animate>

        {/* Lang selector */}
        <Animate type="fadeUp" delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-12">
            {t.mlLangs.map((lang, i) => (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 text-sm font-semibold border transition-colors tracking-wide ${
                  active === i
                    ? 'bg-saffron-400 text-navy-900 border-saffron-400'
                    : 'border-navy-700 text-navy-400 hover:border-saffron-400 hover:text-white'
                }`}
              >
                {lang}
              </motion.button>
            ))}
          </div>
        </Animate>

        {/* Side-by-side comparison */}
        <Animate type="scaleIn" delay={0.15}>
          <div className="max-w-3xl border border-navy-800 bg-navy-900/60 shadow-2xl shadow-black/30">
            <div className="grid md:grid-cols-2">
              {/* English */}
              <div className="p-8 border-r border-navy-800">
                <div className="text-xs font-bold tracking-widest uppercase text-navy-500 mb-5">ENGLISH</div>
                <div className="text-base font-semibold text-white mb-2">{t.mlEnTitle}</div>
                <p className="text-sm text-navy-300 mb-6 leading-relaxed">{t.mlEnBody}</p>
                <div className="border-t border-navy-800 pt-4 space-y-2">
                  <div className="text-xs text-navy-500 font-semibold mb-2">{t.mlNote}</div>
                  <div className="text-sm italic text-saffron-300">Eclipta alba</div>
                  <div className="text-sm italic text-saffron-300">Phyllanthus emblica</div>
                  <div className="text-xs text-navy-500 font-semibold mt-3">{t.mlLegal}</div>
                </div>
              </div>
              {/* Dynamic language */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 bg-navy-950/60"
                >
                  <div className="text-xs font-bold tracking-widest uppercase text-saffron-400 mb-5">{t.mlLangs[active]}</div>
                  <div className="text-base font-semibold text-white mb-2">{t.mlHiTitle}</div>
                  <p className="text-sm text-navy-300 mb-6 leading-relaxed">{t.mlHiBody}</p>
                  <div className="border-t border-navy-800 pt-4 space-y-2">
                    <div className="text-xs text-navy-500 font-semibold mb-2">{t.mlNote}</div>
                    <div className="text-sm italic text-saffron-300">Eclipta alba</div>
                    <div className="text-sm italic text-saffron-300">Phyllanthus emblica</div>
                    <div className="text-xs text-navy-500 font-semibold mt-3">{t.mlLegal}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
