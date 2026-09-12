import Animate from '../Animate'
import FeatureBlock from './FeatureBlock'
import { ShieldCheck, Search, Leaf, Link, Globe } from 'lucide-react'

const features = [
  {
    title: 'Statutory Classification Engine',
    description: 'AI-powered identification of applicable regulatory frameworks. The system classifies your formulation under Schedule E(1), DMR Act 1954, D&C Act, and Ayurvedic Pharmacopoeia standards automatically.',
    bullets: [
      'Instant Schedule E(1) toxicity screening across all listed botanicals',
      'Drugs & Magic Remedies Act prohibited-claims detection',
      'D&C Act licensing category determination (ASU drugs)',
    ],
    visual: (
      <div className="p-6 space-y-4 bg-gradient-to-br from-navy-50/50 to-white">
        <div className="flex items-center gap-2 text-xs font-bold text-navy-700 tracking-widest uppercase">
          <ShieldCheck className="w-4 h-4 text-saffron-500" />
          Statutory Classification
        </div>
        <div className="space-y-2">
          {['Schedule E(1) — Toxicity', 'DMR Act 1954 — Claims', 'D&C Act — Licensing', 'ASU Pharmacopoeia'].map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-3">
              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-green-500'}`} />
              <span className="text-sm text-navy-800 font-medium">{s}</span>
              <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {i === 0 ? 'HIGH RISK' : i === 1 ? 'REVIEW' : 'COMPLIANT'}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'IPR & Prior Art Analysis',
    description: 'Cross-references your formulation against the Traditional Knowledge Digital Library (TKDL) and patent databases to identify prior art overlaps and patentability considerations.',
    bullets: [
      'TKDL cross-referencing for traditional knowledge prior art',
      'Patent landscape mapping via IMPPAT botanical intelligence',
      'Novelty assessment for formulation-level IP protection',
    ],
    visual: (
      <div className="p-6 space-y-4 bg-gradient-to-br from-navy-50/50 to-white">
        <div className="flex items-center gap-2 text-xs font-bold text-navy-700 tracking-widest uppercase">
          <Search className="w-4 h-4 text-saffron-500" />
          Prior Art Detection
        </div>
        <div className="bg-white border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-700">Traditional Knowledge Overlap</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">3 matches</span>
          </div>
          <div className="space-y-2">
            {['TKDL Ref: AY/1204 — Bhringraj oil preparation', 'TKDL Ref: AY/3891 — Amla-based hair formulation', 'Patent IN-2019-MUM-01234 — Eclipta alba extract'].map((r, i) => (
              <div key={i} className="text-xs text-gray-600 flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-saffron-500 mt-0.5">→</span>
                <span className="font-mono">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'ABS & Biodiversity Compliance',
    description: 'Automated screening against the Biological Diversity Act 2002 and NBA (National Biodiversity Authority) regulations. Calculates Access & Benefit Sharing fees for commercial formulations.',
    bullets: [
      'NBA fee computation based on formulation revenue and ingredient sourcing',
      'Biological Diversity Act 2002 compliance assessment',
      'Nagoya Protocol international biodiversity considerations',
    ],
    visual: (
      <div className="p-6 space-y-4 bg-gradient-to-br from-navy-50/50 to-white">
        <div className="flex items-center gap-2 text-xs font-bold text-navy-700 tracking-widest uppercase">
          <Leaf className="w-4 h-4 text-green-600" />
          ABS Fee Calculator
        </div>
        <div className="bg-white border border-gray-100 p-4 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-xs text-gray-500">Ingredients screened</span>
            <span className="text-sm font-bold text-navy-900">3 botanicals</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-xs text-gray-500">BD Act status</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">Review required</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-gray-500">Estimated NBA fee</span>
            <span className="text-sm font-bold text-navy-900">₹2,40,000</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Evidence-Linked Findings',
    description: 'Every regulatory finding in your report traces directly back to a specific statutory section, gazette notification, or pharmacopoeia reference. No hallucinated citations.',
    bullets: [
      'Dual-RAG retrieval from vectorized national and international statute databases',
      'Inline citation linking to the specific Act, Section, and Schedule',
      'Confidence scoring on each finding with source provenance',
    ],
    visual: (
      <div className="p-6 space-y-4 bg-gradient-to-br from-navy-50/50 to-white">
        <div className="flex items-center gap-2 text-xs font-bold text-navy-700 tracking-widest uppercase">
          <Link className="w-4 h-4 text-saffron-500" />
          Citation Trace
        </div>
        <div className="bg-white border border-gray-100 p-4 space-y-3">
          <div className="border-l-2 border-red-500 pl-3 py-1">
            <p className="text-sm text-navy-900 font-semibold mb-1">Schedule E(1) — Restricted Substance</p>
            <p className="text-xs text-gray-500">Eclipta alba listed under toxic dosage limits</p>
            <p className="text-[10px] text-gray-400 mt-1.5 font-mono">Source: D&C Act, Schedule E(1), Entry 42 · Gazette 2019</p>
          </div>
          <div className="border-l-2 border-green-500 pl-3 py-1">
            <p className="text-sm text-navy-900 font-semibold mb-1">Pharmacopoeia Compliant</p>
            <p className="text-xs text-gray-500">Phyllanthus emblica monograph verified</p>
            <p className="text-[10px] text-gray-400 mt-1.5 font-mono">Source: Ayurvedic Pharmacopoeia Vol. I, Part I</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Multilingual Regulatory Reports',
    description: 'Generate complete regulatory evaluations in Hindi, Marathi, Bengali, Tamil, Telugu, and more — powered by Bhashini and Sarvam APIs. Scientific and legal terminology preserved accurately.',
    bullets: [
      '6+ Indian languages with Bhashini NMT integration',
      'Scientific binomial names preserved unchanged across translations',
      'Legal section references remain accurate in every language',
    ],
    visual: (
      <div className="p-6 space-y-4 bg-gradient-to-br from-navy-50/50 to-white">
        <div className="flex items-center gap-2 text-xs font-bold text-navy-700 tracking-widest uppercase">
          <Globe className="w-4 h-4 text-saffron-500" />
          Multilingual Output
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 p-3">
            <div className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider mb-2">English</div>
            <p className="text-xs text-navy-800 leading-relaxed">
              The formulation requires further regulatory review under Schedule E(1).
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-3">
            <div className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider mb-2">हिंदी</div>
            <p className="text-xs text-navy-800 leading-relaxed">
              इस फॉर्मूलेशन को Schedule E(1) के तहत आगे नियामक समीक्षा की आवश्यकता है।
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-3">
            <div className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider mb-2">मराठी</div>
            <p className="text-xs text-navy-800 leading-relaxed">
              या फॉर्म्युलेशनला Schedule E(1) अंतर्गत पुढील नियामक पुनरावलोकन आवश्यक आहे।
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-3">
            <div className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider mb-2">বাংলা</div>
            <p className="text-xs text-navy-800 leading-relaxed">
              এই ফর্মুলেশনের Schedule E(1) এর অধীনে আরও নিয়ন্ত্রক পর্যালোচনা প্রয়োজন।
            </p>
          </div>
        </div>
      </div>
    ),
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section intro */}
        <Animate type="fadeUp">
          <div className="text-center mb-16 lg:mb-24">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-saffron-500 mb-4 block">
              Intelligence Layers
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight mb-5">
              One Formulation. Six Intelligence Layers.<br />Complete Regulatory Clarity.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Every evaluation passes through six specialized AI agents — each cross-referencing statutes, databases, and pharmacopoeias to produce an evidence-linked regulatory dossier.
            </p>
          </div>
        </Animate>

        {/* Feature blocks */}
        <div className="divide-y divide-gray-100">
          {features.map((f, i) => (
            <FeatureBlock
              key={i}
              index={i}
              title={f.title}
              description={f.description}
              bullets={f.bullets}
              visual={f.visual}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
