import PageTransition from '../components/PageTransition'
import Animate from '../components/Animate'
import { motion } from 'framer-motion'
import CTA from '../components/CTA'
import { useNavigate } from 'react-router-dom'

const steps = [
  {
    num: '01',
    title: 'Describe Your Formulation',
    body: 'Enter your Ayurvedic formulation name, ingredients, and intended use in natural language — in English or any supported Indian language.',
    img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=700&q=80',
    detail: [
      'Natural language input supported',
      'Multi-ingredient formulations',
      'Hindi, Marathi, Bengali and more',
      'Scientific names auto-identified',
    ],
  },
  {
    num: '02',
    title: 'Multi-Layer Analysis',
    body: 'IP-SAKTI evaluates your formulation across six intelligence layers simultaneously — regulatory, IPR, traditional knowledge, ingredient intelligence, ABS/biodiversity, and evidence.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
    detail: [
      'Regulatory status check',
      'Patent and prior-art scan',
      'Traditional Knowledge Digital Library cross-reference',
      'Nagoya Protocol / ABS obligations',
    ],
  },
  {
    num: '03',
    title: 'Receive a Structured Report',
    body: 'Download a professional regulatory dossier with 9 sections, evidence citations, and findings in your chosen language. Suitable for internal review and compliance documentation.',
    img: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=700&q=80',
    detail: [
      '9-section structured report',
      'Evidence-linked findings',
      'Bilingual output (English + Indian language)',
      'PDF download ready',
    ],
  },
]

export default function HowItWorksPage({ t }) {
  const navigate = useNavigate()
  return (
    <PageTransition>
      {/* Banner */}
      <div className="bg-navy-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-400 font-semibold mb-4">Process</div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">How IP-SAKTI Works</h1>
            <p className="text-navy-300 text-lg max-w-2xl">Three steps. One integrated evaluation. A structured regulatory report.</p>
          </Animate>
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, i) => (
        <section key={i} className={`py-20 border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className={`max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            <Animate type={i % 2 === 0 ? 'fadeLeft' : 'fadeRight'}>
              <div>
                <div className="text-6xl font-bold text-gray-100 mb-2 select-none leading-none">{step.num}</div>
                <div className="text-xs uppercase tracking-widest text-saffron-500 font-semibold mb-3">{step.title}</div>
                <p className="text-gray-500 leading-relaxed mb-6">{step.body}</p>
                <ul className="space-y-2">
                  {step.detail.map((d, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-navy-700">
                      <span className="text-saffron-500 font-bold mt-0.5">→</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Animate>
            <Animate type={i % 2 === 0 ? 'fadeRight' : 'fadeLeft'} delay={0.1}>
              <img src={step.img} alt={step.title} className="w-full h-64 object-cover border border-gray-200 shadow-sm" />
            </Animate>
          </div>
        </section>
      ))}

      {/* Flow diagram */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <Animate type="fadeUp">
            <h2 className="text-2xl font-bold text-navy-900 mb-12 text-center">The Evaluation Pipeline</h2>
          </Animate>
          <div className="flex flex-col items-center gap-0">
            {['Formulation Input', 'Language Processing', 'Regulatory Layer', 'IPR Layer', 'Traditional Knowledge Layer', 'ABS / Biodiversity Layer', 'Evidence Compilation', 'Report Generation'].map((node, i) => (
              <Animate key={i} type="fadeUp" delay={i * 0.06}>
                <div className="w-72">
                  <motion.div
                    whileHover={{ x: 6 }}
                    className={`border px-5 py-3 text-sm font-medium text-center ${
                      i === 0 ? 'bg-navy-900 text-white border-navy-900' :
                      i === 7 ? 'bg-saffron-50 text-saffron-700 border-saffron-400' :
                      'bg-white text-navy-800 border-gray-200'
                    }`}
                  >
                    {node}
                  </motion.div>
                  {i < 7 && (
                    <div className="flex justify-center py-1.5">
                      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      <CTA t={t} />
    </PageTransition>
  )
}
