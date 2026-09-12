import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}
const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

const stats = [
  { num: '6+', label: 'Indian Languages' },
  { num: '9', label: 'Report Sections' },
  { num: '100%', label: 'Evidence-Linked' },
]

const layers = ['Regulatory', 'IPR', 'Traditional Knowledge', 'ABS', 'Evidence', 'Multilingual']

export default function Hero({ t }) {
  const navigate = useNavigate()

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Background dot grid, right half only */}
      <div className="absolute inset-y-0 right-0 w-1/2 dot-grid opacity-40 pointer-events-none" />
      {/* Saffron accent line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron-500 via-saffron-400 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-20 items-center">

        {/* ── LEFT ── */}
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div variants={item} className="flex items-center gap-3 mb-7">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-saffron-600 border border-saffron-300 bg-saffron-50 px-3 py-1.5">
              {t.heroEyebrow}
            </span>
            <span className="hidden sm:block h-px w-12 bg-saffron-300" />
          </motion.div>

          <motion.h1
            variants={item}
            className="text-[2.8rem] lg:text-[3.4rem] font-bold text-navy-900 leading-[1.12] mb-7 tracking-tight text-balance"
          >
            {t.heroHeadline}
          </motion.h1>

          <motion.div variants={item} className="divider-line mb-7" />

          <motion.p variants={item} className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
            {t.heroPara}
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: '#163060' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/evaluate')}
              className="bg-navy-900 text-white text-sm font-semibold px-9 py-3.5 tracking-wide shadow-md shadow-navy-900/20 transition-colors"
            >
              {t.heroCta1}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: '#f0f4fa' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/how-it-works')}
              className="border-2 border-navy-900 text-navy-900 text-sm font-semibold px-9 py-3.5 tracking-wide transition-colors"
            >
              {t.heroCta2}
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} className="flex gap-10 pt-8 border-t border-gray-100">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-navy-900 leading-none">{s.num}</div>
                <div className="text-xs text-gray-400 mt-1.5 tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Main image card */}
          <div className="relative overflow-hidden shadow-2xl shadow-navy-900/25 border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=85"
              alt="Ayurvedic herbs and research"
              className="w-full h-72 object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/50 to-transparent" />

            {/* Overlay text */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="text-xs tracking-[0.2em] uppercase text-saffron-300 mb-2 font-semibold">Formulation Under Review</div>
              <div className="text-xl font-bold text-white mb-1">Bhringraj Hair Oil</div>
              <div className="text-sm text-navy-200 italic">Eclipta alba · Phyllanthus emblica · Murraya koenigii</div>
            </div>

            {/* Top-right badge */}
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
              <span className="text-xs font-semibold text-white tracking-wider">IP-SAKTI 2.0</span>
            </div>
          </div>

          {/* Pipeline card */}
          <div className="border border-gray-200 bg-white shadow-lg shadow-gray-100">
            <div className="bg-navy-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-saffron-400" />
                <span className="text-xs font-bold tracking-widest uppercase">Intelligence Pipeline</span>
              </div>
              <span className="text-xs text-navy-400">6 layers active</span>
            </div>
            <div className="p-5 grid grid-cols-3 gap-2.5">
              {layers.map((l, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  whileHover={{ backgroundColor: '#0f2248', color: '#fff', borderColor: '#0f2248' }}
                  className="border border-navy-100 bg-navy-50/80 px-2.5 py-2.5 text-xs font-semibold text-navy-700 text-center cursor-default transition-colors leading-tight"
                >
                  {l}
                </motion.div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-saffron-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-saffron-500" />
                <span className="text-xs font-semibold text-saffron-700">Actionable Regulatory Report</span>
              </div>
              <button
                onClick={() => navigate('/evaluate')}
                className="text-xs font-bold text-navy-900 bg-white border border-navy-200 px-3 py-1.5 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-colors"
              >
                Start →
              </button>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -top-5 -left-5 bg-white border border-saffron-200 shadow-xl shadow-saffron-100/50 px-5 py-3 hidden lg:block"
          >
            <div className="text-xs font-bold text-saffron-600 uppercase tracking-wider mb-0.5">6 Languages</div>
            <div className="text-xs text-gray-400">हिंदी · मराठी · বাংলা</div>
          </motion.div>

          {/* Corner accent */}
          <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-2 border-r-2 border-saffron-400 pointer-events-none hidden lg:block" />
        </motion.div>
      </div>
    </section>
  )
}
