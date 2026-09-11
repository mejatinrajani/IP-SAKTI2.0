import PageTransition from '../components/PageTransition'
import Animate from '../components/Animate'
import CTA from '../components/CTA'

export default function AboutPage({ t }) {
  const team = [
    { name: 'Dr. Priya Sharma', role: 'Regulatory Intelligence Lead', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80' },
    { name: 'Arjun Mehta', role: 'IPR & Patent Analysis', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80' },
    { name: 'Dr. Kavitha Nair', role: 'Traditional Knowledge', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80' },
  ]

  return (
    <PageTransition>
      {/* Hero banner */}
      <div className="relative bg-navy-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1576671081837-49000212a370?w=1400&q=80"
          alt="Ayurvedic research"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-400 font-semibold mb-4">About</div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Bringing Clarity to<br />India's Regulatory Landscape
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl leading-relaxed">
              IP-SAKTI 2.0 is a research and intelligence platform built to help innovators, formulators
              and researchers navigate the complex intersection of Ayurvedic innovation, intellectual
              property, and regulatory compliance.
            </p>
          </Animate>
        </div>
      </div>

      {/* Mission */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <Animate type="fadeLeft">
            <div>
              <div className="text-xs uppercase tracking-widest text-saffron-500 font-semibold mb-4">Our Mission</div>
              <h2 className="text-3xl font-bold text-navy-900 mb-6 leading-snug">
                Making regulatory intelligence accessible and actionable
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                India's Ayurvedic sector is one of the world's most dynamic innovation spaces. Yet navigating
                the regulatory, IP, and traditional knowledge landscape remains fragmented, expensive, and
                time-consuming. IP-SAKTI 2.0 changes that.
              </p>
              <p className="text-gray-500 leading-relaxed">
                We integrate regulatory data, IPR databases, traditional knowledge records, and biodiversity
                obligations into a single, multilingual evaluation workflow — delivering structured,
                evidence-linked reports in the language you work in.
              </p>
            </div>
          </Animate>
          <Animate type="fadeRight" delay={0.1}>
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=80"
              alt="Research and analysis"
              className="w-full h-72 object-cover border border-gray-200"
            />
          </Animate>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 border-b border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-500 font-semibold mb-4 text-center">Principles</div>
            <h2 className="text-3xl font-bold text-navy-900 mb-14 text-center">What guides us</h2>
          </Animate>
          <div className="grid md:grid-cols-3 gap-0 border border-gray-200 bg-white">
            {[
              { num: '01', title: 'Evidence First', body: 'Every finding is grounded in verifiable regulatory sources, not assumptions.' },
              { num: '02', title: 'Language Inclusive', body: 'Regulatory intelligence should work in the language of the innovator, not just English.' },
              { num: '03', title: 'Institutionally Rigorous', body: 'Our framework is built around real regulatory, IPR and traditional knowledge frameworks.' },
            ].map((v, i) => (
              <Animate key={i} type="fadeUp" delay={i * 0.1}>
                <div className={`px-8 py-10 ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                  <div className="text-5xl font-bold text-gray-100 mb-4 select-none">{v.num}</div>
                  <div className="text-xs font-bold tracking-widest uppercase text-saffron-500 mb-3">{v.title}</div>
                  <p className="text-gray-500 leading-relaxed text-sm">{v.body}</p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Animate type="fadeUp">
            <div className="text-xs uppercase tracking-widest text-saffron-500 font-semibold mb-4 text-center">Team</div>
            <h2 className="text-3xl font-bold text-navy-900 mb-14 text-center">Built by domain experts</h2>
          </Animate>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((m, i) => (
              <Animate key={i} type="fadeUp" delay={i * 0.12}>
                <div className="border border-gray-200 bg-white">
                  <img src={m.img} alt={m.name} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <div className="font-semibold text-navy-900 mb-1">{m.name}</div>
                    <div className="text-xs text-saffron-600 font-medium uppercase tracking-wider">{m.role}</div>
                  </div>
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
