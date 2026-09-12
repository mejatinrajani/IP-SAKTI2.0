import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Animate from '../Animate'

export default function FinalCTA() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section className="relative bg-navy-900 py-28 overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)' }} />
      {/* Saffron glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-saffron-500/5 blur-3xl rounded-full pointer-events-none" />
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-saffron-400 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <Animate type="fadeUp">
          <div className="inline-block border border-saffron-700 bg-saffron-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase text-saffron-300 mb-8">
            IP-SAKTI 2.0
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            Stop researching regulations manually.<br />Start evaluating intelligently.
          </h2>
          <p className="text-navy-300 text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
            Describe your formulation. Receive evidence-linked regulatory findings. Download your dossier. All in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#ffbd61' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(user ? '/evaluate' : '/auth')}
              className="bg-saffron-400 text-navy-900 font-black text-sm px-14 py-4 tracking-widest uppercase transition-colors shadow-xl shadow-saffron-400/20"
            >
              Start an Evaluation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const el = document.getElementById('features')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="border border-navy-600 text-navy-300 font-semibold text-sm px-10 py-4 tracking-wide transition-colors hover:text-white"
            >
              Explore the Platform
            </motion.button>
          </div>
        </Animate>
      </div>
    </section>
  )
}
