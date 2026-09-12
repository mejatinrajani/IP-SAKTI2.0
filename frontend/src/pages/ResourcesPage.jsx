import PageTransition from '../components/PageTransition'
import Animate from '../components/Animate'
import { motion } from 'framer-motion'
import CTA from '../components/CTA'

const resources = [
  {
    category: 'Regulatory Frameworks',
    items: [
      { title: 'Drugs & Cosmetics Act, 1940', type: 'Legislation', desc: 'The primary legislation governing drugs and cosmetics in India, including Ayurvedic preparations.' },
      { title: 'AYUSH Licensing Guidelines', type: 'Guidelines', desc: 'Ministry of AYUSH guidelines for manufacture and sale of Ayurvedic, Siddha and Unani medicines.' },
      { title: 'Cosmetics Rules, 2020', type: 'Rules', desc: 'Updated rules for classification, labelling and approval of cosmetic products under the D&C Act.' },
    ],
  },
  {
    category: 'Intellectual Property',
    items: [
      { title: 'Patents Act, 1970', type: 'Legislation', desc: 'Governs the grant and protection of patents in India, including provisions relevant to traditional knowledge.' },
      { title: 'Traditional Knowledge Digital Library (TKDL)', type: 'Database', desc: 'A database of traditional knowledge from classical Ayurvedic, Siddha, and Unani texts.' },
      { title: 'Patent Office India', type: 'Authority', desc: 'The official body for filing, examination and grant of patents in India.' },
    ],
  },
  {
    category: 'Biodiversity & ABS',
    items: [
      { title: 'Biological Diversity Act, 2002', type: 'Legislation', desc: 'Governs access to biological resources and benefit-sharing with local communities and the nation.' },
      { title: 'Nagoya Protocol', type: 'International', desc: 'An international protocol under the Convention on Biological Diversity governing access and benefit-sharing.' },
      { title: 'National Biodiversity Authority', type: 'Authority', desc: 'Statutory body under the Ministry of Environment, Forest and Climate Change for biodiversity regulation.' },
    ],
  },
]

const typeStyle = {
  'Legislation': 'bg-navy-50 text-navy-700 border-navy-200',
  'Guidelines': 'bg-saffron-50 text-saffron-700 border-saffron-200',
  'Rules': 'bg-gray-100 text-gray-600 border-gray-200',
  'Database': 'bg-green-50 text-green-700 border-green-200',
  'Authority': 'bg-purple-50 text-purple-700 border-purple-200',
  'International': 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ResourcesPage({ t }) {
  return (
    <PageTransition>
      {/* Banner */}
      <div className="relative bg-navy-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=80"
          alt="Resources"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-400 font-semibold mb-4">Resources</div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Regulatory Reference Library</h1>
            <p className="text-navy-300 text-lg max-w-2xl">
              Key regulatory frameworks, IP resources, and biodiversity legislation relevant to Ayurvedic innovation in India.
            </p>
          </Animate>
        </div>
      </div>

      {/* Resources */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          {resources.map((group, gi) => (
            <div key={gi}>
              <Animate type="fadeUp">
                <div className="text-xs uppercase tracking-widest text-saffron-500 font-semibold mb-2">{group.category}</div>
                <div className="border-b border-gray-100 mb-8 pb-2" />
              </Animate>
              <div className="space-y-3">
                {group.items.map((item, i) => (
                  <Animate key={i} type="fadeUp" delay={i * 0.08}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="border border-gray-200 bg-white px-6 py-5 flex items-start justify-between gap-4 transition-colors hover:border-navy-200"
                    >
                      <div className="flex gap-4 items-start">
                        <div>
                          <span className={`text-xs font-semibold border px-2 py-0.5 mr-3 ${typeStyle[item.type] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {item.type}
                          </span>
                          <span className="text-sm font-semibold text-navy-900">{item.title}</span>
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-navy-500 hover:text-navy-900 flex-shrink-0 underline underline-offset-2 transition-colors">
                        View →
                      </button>
                    </motion.div>
                  </Animate>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTA t={t} />
    </PageTransition>
  )
}
