import Animate from '../Animate'
import ComparisonCard from './ComparisonCard'
import { Layers, Bot, ShieldCheck, Share2 } from 'lucide-react'

const cards = [
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Dual-RAG Architecture',
    description: 'Separate vector databases for national and international statutes. Each query retrieves jurisdiction-specific evidence — no cross-contamination between Indian drug law and WHO/FDA guidelines.',
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: '6-Agent LangGraph Orchestrator',
    description: 'Not a single-prompt chatbot. Six specialized AI agents (Classifier, Regulatory, IPR, ABS, Evidence, Reporter) collaborate through a state graph to produce a comprehensive evaluation.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'DPDP-Compliant Data Masking',
    description: 'Proprietary formulation details are masked before reaching any LLM. Your trade secrets never leave the secure pipeline — compliant with India\'s Digital Personal Data Protection Act 2023.',
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    title: 'Neo4j Knowledge Graph',
    description: 'IMPPAT botanical intelligence mapped as a traversable graph. 1,700+ medicinal plants, their phytochemical profiles, and regulatory classifications — queryable in real time.',
  },
]

export default function DifferentiationGrid() {
  return (
    <section className="relative bg-gray-50 py-20 lg:py-28 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <Animate type="fadeUp">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-saffron-500 mb-4 block">
              Architecture
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight mb-5">
              Built different. Built for regulatory precision.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              IP-SAKTI 2.0 isn't a wrapper around a general-purpose LLM. It's a purpose-built regulatory intelligence system with specialized architecture at every layer.
            </p>
          </div>
        </Animate>

        <Animate type="fadeUp" delay={0.15}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <ComparisonCard key={i} {...card} />
            ))}
          </div>
        </Animate>
      </div>
    </section>
  )
}
