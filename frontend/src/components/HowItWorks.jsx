import { motion } from 'framer-motion'
import Animate from './Animate'

export default function HowItWorks({ t }) {
  return (
    <section className="relative bg-navy-950 border-b border-navy-800 py-28 overflow-hidden">
      {/* Line grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage:'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)'}}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <Animate type="fadeUp">
          <span className="section-label text-saffron-400">Process</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-4 tracking-tight">{t.howHeading}</h2>
          <div className="divider-line mb-16" />
        </Animate>

        <div className="grid md:grid-cols-3 gap-6">
          {t.howSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, borderColor: '#ff9a2d' }}
              className="border border-navy-700 bg-navy-900/80 p-8 transition-all group cursor-default"
            >
              {/* Large number watermark */}
              <div className="text-8xl font-black text-navy-800 mb-6 leading-none select-none group-hover:text-navy-700 transition-colors">
                {step.num}
              </div>
              <div className="w-8 h-0.5 bg-saffron-500 mb-4" />
              <div className="text-xs font-bold tracking-[0.18em] uppercase text-saffron-400 mb-3">{step.title}</div>
              <p className="text-navy-300 leading-relaxed text-sm">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
