import { motion } from 'framer-motion'
import Animate from './Animate'

export default function Trust({ t }) {
  return (
    <section className="relative bg-navy-950 border-b border-navy-800 py-16 overflow-hidden">
      {/* Background stripe */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <p className="text-navy-400 text-xs tracking-[0.2em] uppercase font-semibold text-center mb-10">
            {t.trustHeading}
          </p>
        </Animate>
        <Animate type="fadeUp" delay={0.1}>
          <div className="flex flex-wrap justify-center gap-0 divide-x divide-navy-800">
            {t.trustItems.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                className="px-8 py-3 text-center transition-colors cursor-default group"
              >
                <span className="text-sm font-semibold text-navy-200 group-hover:text-white transition-colors tracking-wide">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </Animate>
      </div>
    </section>
  )
}
