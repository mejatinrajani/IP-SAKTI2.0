import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { labelKey: 'about',        path: '/about' },
  { labelKey: 'howItWorks',   path: '/how-it-works' },
  { labelKey: 'capabilities', path: '/capabilities' },
  { labelKey: 'evidence',     path: '/evidence' },
  { labelKey: 'resources',    path: '/resources' },
]

export default function Header({ t }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>
      {/* Thin saffron accent at very top */}
      <div className="h-0.5 bg-gradient-to-r from-saffron-500 via-saffron-400 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 group flex items-center gap-3">
          <div className="w-8 h-8 bg-navy-900 flex items-center justify-center flex-shrink-0">
            <span className="text-saffron-400 font-black text-sm leading-none">IP</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-navy-900 leading-none group-hover:text-navy-700 transition-colors">
              IP-SAKTI <span className="text-saffron-500">2.0</span>
            </div>
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5 hidden sm:block">
              Regulatory Intelligence
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ labelKey, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-sm font-medium px-4 py-2 transition-colors relative ${
                  isActive
                    ? 'text-navy-900 bg-navy-50'
                    : 'text-gray-500 hover:text-navy-900 hover:bg-gray-50'
                }`
              }
            >
              {t.nav[labelKey]}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <span className="text-xs text-gray-400 max-w-[140px] truncate">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-navy-900 font-medium px-4 py-2 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-500 hover:text-navy-900 font-medium px-4 py-2 transition-colors"
            >
              {t.signIn}
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-navy-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-current transition-all mb-1.5 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current transition-all mb-1.5 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {navLinks.map(({ labelKey, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-gray-700 font-medium py-2.5 px-3 hover:bg-gray-50 transition-colors"
                >
                  {t.nav[labelKey]}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <span className="text-xs text-gray-400 px-3 truncate">{user.email}</span>
                    <button onClick={() => { setMenuOpen(false); signOut() }}
                      className="text-sm text-gray-500 font-medium text-left px-3 py-2">Sign Out</button>
                  </>
                ) : (
                  <button onClick={() => { setMenuOpen(false); navigate('/auth') }}
                    className="text-sm text-gray-500 font-medium text-left px-3 py-2">{t.signIn}</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
