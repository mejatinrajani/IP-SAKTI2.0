import { motion } from 'framer-motion'
import Animate from './Animate'

export default function IPR({ t }) {
  return (
    <section className="relative bg-white border-b border-gray-100 py-24 overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-navy-50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        {/* Flow diagram */}
        <Animate type="fadeLeft">
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-72">
              {/* Vertical connector line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-navy-200 via-navy-300 to-navy-900 -z-10" />
              {t.iprFlow.map((item, i) => (
                <div key={i} className="relative flex justify-center mb-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ x: 5 }}
                    className={`relative w-full border-2 px-6 py-4 text-sm font-bold text-center transition-all mb-3 ${
                      i === 0 ? 'border-navy-200 bg-white text-navy-800 shadow-sm' :
                      i === 1 ? 'border-navy-300 bg-navy-50 text-navy-800 shadow-sm' :
                      i === 2 ? 'border-navy-500 bg-navy-100 text-navy-900 shadow-md' :
                      'border-navy-900 bg-navy-900 text-white shadow-xl shadow-navy-900/30'
                    }`}
                  >
                    {i < 3 && (
                      <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 ${
                        i === 0 ? 'bg-white border-navy-300' :
                        i === 1 ? 'bg-navy-200 border-navy-400' :
                        'bg-navy-500 border-navy-600'
                      }`} />
                    )}
                    {item}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </Animate>

        {/* Text + image */}
        <Animate type="fadeRight" delay={0.1}>
          <span className="section-label">Intellectual Property</span>
          <h2 className="text-4xl font-bold text-navy-900 mt-4 mb-3 leading-tight tracking-tight">{t.iprHeading}</h2>
          <div className="divider-line mb-6" />
          <p className="text-gray-500 leading-relaxed mb-7">{t.iprPara}</p>
          <div className="relative overflow-hidden shadow-lg shadow-gray-200">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=85"
              alt="Legal documents"
              className="w-full h-44 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900/40 to-transparent" />
            <div className="absolute bottom-4 left-5 text-white text-xs font-semibold tracking-wider uppercase">
              Prior Art · Patents · TKDL
            </div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
