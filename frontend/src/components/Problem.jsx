import { motion } from 'framer-motion'
import Animate from './Animate'

export default function Problem({ t }) {
  return (
    <section className="relative bg-gray-50 border-b border-gray-200 py-24 overflow-hidden">
      {/* Side accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-saffron-400 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <Animate type="fadeLeft">
          <span className="section-label">The Challenge</span>
          <h2 className="text-4xl font-bold text-navy-900 mt-4 mb-3 leading-tight tracking-tight">{t.probHeading}</h2>
          <div className="divider-line mb-6" />
          <p className="text-gray-500 leading-relaxed mb-8 text-base">
            India's Ayurvedic innovators navigate multiple regulatory frameworks, intellectual-property databases,
            traditional knowledge records, and biodiversity obligations — each requiring separate research and expertise.
          </p>
          <div className="border-l-[3px] border-saffron-400 bg-saffron-50 pl-5 pr-4 py-4">
            <p className="text-navy-800 font-medium leading-relaxed">{t.probStatement}</p>
          </div>
        </Animate>

        <Animate type="fadeRight" delay={0.1}>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&q=85"
              alt="Research documents"
              className="w-full h-52 object-cover border border-gray-200 shadow-lg shadow-gray-200 mb-6"
            />
            <div className="flex flex-col items-center gap-0">
              {t.probItems.map((item, i) => (
                <div key={i} className="w-full flex flex-col items-center">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="w-full border border-gray-200 bg-white px-5 py-3.5 text-sm font-medium text-navy-800 text-center shadow-sm"
                  >
                    {item}
                  </motion.div>
                  {i < t.probItems.length - 1 && (
                    <div className="flex justify-center py-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 w-full">
                <div className="border-2 border-saffron-400 bg-saffron-50 px-5 py-3.5 text-sm font-bold text-saffron-700 text-center">
                  ✗ Fragmented. Unclear. Expensive.
                </div>
              </div>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  )
}
