import PageTransition from '../components/PageTransition'
import Animate from '../components/Animate'
import { motion } from 'framer-motion'
import CTA from '../components/CTA'

const caps = [
  {
    title: 'Regulatory Intelligence',
    desc: 'Evaluate your formulation against applicable Ayurvedic and cosmetic regulatory frameworks. Identify licensing, labelling, and approval considerations.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
    tags: ['Licensing', 'Labelling', 'AYUSH Guidelines', 'Cosmetic Rules'],
  },
  {
    title: 'Intellectual Property (IPR)',
    desc: 'Scan for existing patents, prior art, and traditional-knowledge overlaps that may affect patentability or freedom-to-operate for your formulation.',
    img: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=80',
    tags: ['Patent Search', 'Prior Art', 'Freedom to Operate', 'TKDL Cross-reference'],
  },
  {
    title: 'Traditional Knowledge (TK)',
    desc: 'Cross-reference formulation ingredients against the Traditional Knowledge Digital Library and classical Ayurvedic texts to surface relevant traditional-use records.',
    img: 'https://images.unsplash.com/photo-1531425300797-d55db92e7036?w=600&q=80',
    tags: ['TKDL', 'Classical Texts', 'Prior Use Records', 'TK Protection'],
  },
  {
    title: 'Biodiversity & ABS',
    desc: 'Identify biodiversity-sensitive ingredients and assess obligations under the Nagoya Protocol and Biological Diversity Act relevant to your formulation.',
    img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    tags: ['Nagoya Protocol', 'Biological Diversity Act', 'Access & Benefit Sharing', 'Sensitive Species'],
  },
  {
    title: 'Evidence Layer',
    desc: 'Every regulatory and IPR finding is linked to primary sources — regulatory text, gazette notifications, database entries — so every conclusion is traceable.',
    img: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80',
    tags: ['Primary Sources', 'Gazette Notifications', 'Database Citations', 'Traceable Findings'],
  },
  {
    title: 'Multilingual Reports',
    desc: 'Generate full regulatory dossiers in English plus any supported Indian language. Scientific names and legal references stay precise across all languages.',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    tags: ['Hindi', 'Marathi', 'Bengali', 'Tamil', 'Telugu'],
  },
]

export default function CapabilitiesPage({ t }) {
  return (
    <PageTransition>
      {/* Banner */}
      <div className="relative bg-navy-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1400&q=80"
          alt="Capabilities"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-400 font-semibold mb-4">Capabilities</div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Six Intelligence Layers</h1>
            <p className="text-navy-300 text-lg max-w-2xl">
              Each capability addresses a distinct dimension of the regulatory and IP landscape for Ayurvedic formulations.
            </p>
          </Animate>
        </div>
      </div>

      {/* Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caps.map((cap, i) => (
              <Animate key={i} type="fadeUp" delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(10,24,48,0.10)' }}
                  className="border border-gray-200 bg-white transition-shadow"
                >
                  <img src={cap.img} alt={cap.title} className="w-full h-44 object-cover" />
                  <div className="p-6">
                    <div className="font-bold text-navy-900 mb-2">{cap.title}</div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{cap.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {cap.tags.map(tag => (
                        <span key={tag} className="text-xs border border-navy-100 text-navy-600 px-2.5 py-1 bg-navy-50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      <CTA t={t} />
    </PageTransition>
  )
}
