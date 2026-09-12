import { useState } from 'react'
import PageTransition from '../components/PageTransition'
import Animate from '../components/Animate'
import { motion, AnimatePresence } from 'framer-motion'
import CTA from '../components/CTA'

const findings = [
  {
    id: 'REG-001',
    type: 'Regulatory',
    ingredient: 'Eclipta alba',
    title: 'Listed in Ayurvedic Pharmacopoeia of India',
    basis: 'API Vol. I, 2001 — Part I',
    source: 'Ministry of AYUSH — Government of India',
    detail: 'Eclipta alba (Bhringraj) is officially listed in the Ayurvedic Pharmacopoeia of India. Preparations containing this herb in topical application qualify under AYUSH licensing guidelines.',
  },
  {
    id: 'IPR-004',
    type: 'IPR',
    ingredient: 'Phyllanthus emblica',
    title: 'Prior Art — Traditional Use Records in TKDL',
    basis: 'Traditional Knowledge Digital Library',
    source: 'TKDL Database — Entry #AM-2847',
    detail: 'Multiple entries in the TKDL document the traditional use of Phyllanthus emblica (Amla) in hair preparations. These records constitute prior art that may affect patentability of novel claims.',
  },
  {
    id: 'ABS-002',
    type: 'ABS',
    ingredient: 'Murraya koenigii',
    title: 'Biodiversity Act Considerations',
    basis: 'Biological Diversity Act, 2002 — Section 3',
    source: 'National Biodiversity Authority, India',
    detail: 'Commercial use of Murraya koenigii (Curry Leaf) by entities outside India or for commercial purposes may require prior approval under the Biological Diversity Act, 2002.',
  },
  {
    id: 'REG-007',
    type: 'Regulatory',
    ingredient: 'Hair Oil (Topical)',
    title: 'Cosmetic vs. Drug Classification',
    basis: 'Drugs & Cosmetics Act, 1940 — Schedule Q',
    source: 'CDSCO — Central Drugs Standard Control Organisation',
    detail: 'Topical hair oil preparations are typically classified as cosmetics under Schedule Q unless therapeutic claims are made on labelling. Medicinal claims require drug registration.',
  },
]

const typeColors = {
  Regulatory: 'text-navy-700 bg-navy-50 border-navy-200',
  IPR: 'text-saffron-700 bg-saffron-50 border-saffron-200',
  ABS: 'text-green-700 bg-green-50 border-green-200',
}

export default function EvidencePage({ t }) {
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('All')

  const types = ['All', 'Regulatory', 'IPR', 'ABS']
  const filtered = filter === 'All' ? findings : findings.filter(f => f.type === filter)

  return (
    <PageTransition>
      {/* Banner */}
      <div className="bg-navy-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-400 font-semibold mb-4">Evidence</div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Evidence-Linked Findings</h1>
            <p className="text-navy-300 text-lg max-w-2xl">
              Every regulatory, IPR and ABS finding is traceable to a primary source.
              No black-box conclusions — only verifiable intelligence.
            </p>
          </Animate>
        </div>
      </div>

      {/* Filter + List */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Filter tabs */}
          <Animate type="fadeUp">
            <div className="flex gap-2 mb-10 border-b border-gray-100 pb-4">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-5 py-2 text-sm font-medium border transition-colors ${
                    filter === type
                      ? 'bg-navy-900 text-white border-navy-900'
                      : 'border-gray-200 text-gray-500 hover:border-navy-400 hover:text-navy-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Animate>

          {/* Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.06 }}
                  className="border border-gray-200 bg-white"
                >
                  <div
                    className="px-6 py-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(open === f.id ? null : f.id)}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-xs font-bold text-gray-300 w-16 flex-shrink-0 pt-0.5">{f.id}</span>
                      <div>
                        <span className={`text-xs font-semibold border px-2 py-0.5 mr-3 ${typeColors[f.type]}`}>
                          {f.type}
                        </span>
                        <span className="text-sm font-semibold text-navy-900">{f.title}</span>
                        <div className="text-xs text-gray-400 mt-1 italic">{f.ingredient}</div>
                      </div>
                    </div>
                    <motion.span
                      animate={{ rotate: open === f.id ? 180 : 0 }}
                      className="text-gray-400 flex-shrink-0 mt-1"
                    >
                      ↓
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {open === f.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50 space-y-3">
                          <p className="text-sm text-gray-600 leading-relaxed">{f.detail}</p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <div className="text-xs text-gray-400 font-medium mb-1">Basis</div>
                              <div className="text-sm text-navy-800">{f.basis}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 font-medium mb-1">Source</div>
                              <div className="text-sm text-navy-800">{f.source}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <CTA t={t} />
    </PageTransition>
  )
}
