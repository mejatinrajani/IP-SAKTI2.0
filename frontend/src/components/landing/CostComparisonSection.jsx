import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Check } from 'lucide-react'
import Animate from '../Animate'

const manualCosts = [
  { label: 'IP Attorney Consultation', cost: '₹15,000+' },
  { label: 'Regulatory Consultant', cost: '₹25,000+' },
  { label: 'TKDL / Prior Art Research', cost: '₹10,000+' },
  { label: 'ABS Compliance Audit', cost: '₹20,000+' },
  { label: 'Multi-language Translation', cost: '₹5,000+' },
]

const features = [
  'Statutory classification across all Indian drug acts',
  'IPR & prior art analysis with TKDL cross-referencing',
  'ABS fee calculation & biodiversity compliance',
  'Evidence-linked findings with citation provenance',
  'Multilingual reports in 6+ Indian languages',
  '9-section structured regulatory dossier',
  'PDF export & download',
  'Unlimited evaluations',
]

export default function CostComparisonSection() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section id="pricing" className="relative bg-navy-950 py-24 lg:py-32 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)' }} />
      {/* Saffron glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-saffron-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <Animate type="fadeUp">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-saffron-400 mb-4 block">
              Cost Comparison
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-5">
              What regulatory research costs today
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto leading-relaxed">
              A single Ayurvedic formulation evaluation typically requires multiple consultants, databases, and weeks of research. IP-SAKTI 2.0 replaces that entire workflow — for free.
            </p>
          </div>
        </Animate>

        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-8 lg:gap-4 items-stretch">

          {/* Manual costs column */}
          <Animate type="fadeLeft" delay={0.1}>
            <div className="border border-navy-700/50 bg-navy-900/50 backdrop-blur-sm p-8 h-full flex flex-col">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-navy-400 mb-6">
                Traditional Approach
              </div>
              <div className="space-y-4 flex-1">
                {manualCosts.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-navy-800/50">
                    <span className="text-sm text-navy-200">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.cost}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-navy-700">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-navy-400">Total per evaluation</span>
                  <span className="text-4xl font-bold text-white">₹75,000<span className="text-lg text-navy-400">+</span></span>
                </div>
                <p className="text-xs text-navy-500 mt-2">Plus 3–5 weeks turnaround time</p>
              </div>
            </div>
          </Animate>

          {/* VS divider */}
          <Animate type="scaleIn" delay={0.2}>
            <div className="flex lg:flex-col items-center justify-center gap-3 py-4 lg:py-0">
              <div className="flex-1 lg:flex-none w-full lg:w-px h-px lg:h-full bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-navy-600 to-transparent" />
              <div className="w-14 h-14 rounded-full border-2 border-saffron-400 bg-navy-900 flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-saffron-400 tracking-wider">VS</span>
              </div>
              <div className="flex-1 lg:flex-none w-full lg:w-px h-px lg:h-full bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-navy-600 to-transparent" />
            </div>
          </Animate>

          {/* IP-SAKTI column */}
          <Animate type="fadeRight" delay={0.3}>
            <div className="border border-saffron-400/30 bg-gradient-to-br from-navy-900/80 to-navy-950 backdrop-blur-sm p-8 h-full flex flex-col relative overflow-hidden">
              {/* Glow accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-saffron-400 via-saffron-500 to-transparent" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-navy-800 flex items-center justify-center shrink-0">
                  <span className="text-saffron-400 font-black text-[10px]">IP</span>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-saffron-400">IP-SAKTI 2.0</div>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-saffron-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-navy-200">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-navy-700">
                <div className="flex items-end justify-between mb-6">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-navy-400">Your cost</span>
                  <div className="text-right">
                    <span className="text-5xl font-bold text-saffron-400">₹0</span>
                    <p className="text-xs text-navy-400 mt-1">Free · Instant · AI-powered</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: '#ffbd61' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(user ? '/evaluate' : '/auth')}
                  className="w-full bg-saffron-400 text-navy-900 font-black text-sm py-4 tracking-widest uppercase transition-colors shadow-xl shadow-saffron-400/20"
                >
                  Start Evaluating — Free →
                </motion.button>
              </div>
            </div>
          </Animate>
        </div>
      </div>
    </section>
  )
}
