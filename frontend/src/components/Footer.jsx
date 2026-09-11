import { Link } from 'react-router-dom'

const footerNav = [
  { label: 'About', path: '/about' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Capabilities', path: '/capabilities' },
  { label: 'Evidence', path: '/evidence' },
  { label: 'Resources', path: '/resources' },
]

export default function Footer({ t }) {
  return (
    <footer className="bg-white border-t border-gray-200 py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <div className="text-lg font-bold text-navy-900 mb-1">
              IP-SAKTI <span className="text-saffron-500">2.0</span>
            </div>
            <div className="text-xs text-gray-400 tracking-wide mb-4">{t.footerTagline}</div>
            <p className="text-xs text-gray-400 leading-relaxed">{t.disclaimer}</p>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-gray-300 mb-4">Platform</div>
            {footerNav.slice(0, 3).map(l => (
              <div key={l.path} className="mb-2.5">
                <Link to={l.path} className="text-sm text-gray-500 hover:text-navy-900 transition-colors">{l.label}</Link>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-gray-300 mb-4">Resources</div>
            {footerNav.slice(3).map(l => (
              <div key={l.path} className="mb-2.5">
                <Link to={l.path} className="text-sm text-gray-500 hover:text-navy-900 transition-colors">{l.label}</Link>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-gray-300 mb-4">Legal</div>
            {['Privacy', 'Terms', 'Disclaimer'].map(l => (
              <div key={l} className="mb-2.5">
                <a href="#" className="text-sm text-gray-500 hover:text-navy-900 transition-colors">{l}</a>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-400">© 2026 IP-SAKTI 2.0. All rights reserved.</span>
          <span className="text-xs text-gray-300">An independent regulatory intelligence initiative.</span>
        </div>
      </div>
    </footer>
  )
}
