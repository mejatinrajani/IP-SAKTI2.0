import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'

export default function AuthPage() {
  const { signIn, signUp, verifyOtp, user, loading: authLoading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/evaluate'

  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [otp,      setOtp]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [info,     setInfo]     = useState(null)   // success / info messages

  // Already logged in → go to where they came from
  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true })
  }, [user, authLoading, navigate, from])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      if (mode === 'signin') {
        const { data, error } = await signIn(email, password)
        if (error) {
          if (error.message.includes('Invalid login credentials'))
            throw new Error('Incorrect email or password. Please try again.')
          if (error.message.includes('Email not confirmed'))
            throw new Error('Email not confirmed. Please sign up again — your account will be confirmed automatically.')
          throw error
        }
        // onAuthStateChange fires → useEffect redirects
      } else if (mode === 'signup') {
        // Standard Supabase signup (will send confirmation email if enabled)
        const { data, error: signUpErr } = await signUp(email, password)
        
        if (signUpErr) {
          if (signUpErr.message.toLowerCase().includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.')
          }
          throw signUpErr
        }

        // If email confirmation is disabled, user and session are returned immediately.
        if (data?.session) {
          // onAuthStateChange will fire and redirect
          return
        } else {
          // Email confirmation is enabled
          setInfo('Account created! Please check your email for the OTP code.')
          setMode('verify')
          return
        }
      } else if (mode === 'verify') {
        const { error: verifyErr } = await verifyOtp(email, otp)
        if (verifyErr) {
          throw new Error('Invalid or expired OTP. Please try again.')
        }
        // Verification success will fire onAuthStateChange and redirect
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-108px)] bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Logo mark */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-navy-900 flex items-center justify-center shadow-lg shadow-navy-900/30">
                <span className="text-saffron-400 font-black text-base leading-none">IP</span>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-navy-900 leading-none">
                  IP-SAKTI <span className="text-saffron-500">2.0</span>
                </div>
                <div className="text-xs text-gray-400 tracking-widest uppercase mt-1">
                  Regulatory Intelligence
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {mode === 'signin'
                ? 'Sign in to access your regulatory evaluations.'
                : 'Create a free account to get started.'}
            </p>
          </div>

          {/* Mode tabs */}
          {mode !== 'verify' && (
            <div className="flex border border-gray-200 bg-white mb-6 overflow-hidden shadow-sm">
              {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([m, label]) => (
                <button key={m}
                  onClick={() => { setMode(m); setError(null); setInfo(null) }}
                  className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${
                    mode === m ? 'bg-navy-900 text-white' : 'text-gray-500 hover:text-navy-900 bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Form card */}
          <div className="bg-white border border-gray-200 shadow-sm p-8">

            <AnimatePresence mode="wait">
              {info && (
                <motion.div key="info"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-start gap-2 leading-relaxed"
                >
                  <span className="flex-shrink-0 mt-0.5">ℹ</span> {info}
                </motion.div>
              )}
              {error && (
                <motion.div key="error"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2 leading-relaxed"
                >
                  <span className="flex-shrink-0 mt-0.5">✗</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {mode !== 'verify' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                        Password
                      </label>
                      {mode === 'signin' && (
                        <span className="text-xs text-gray-400">Min 6 characters</span>
                      )}
                    </div>
                    <input
                      type="password" required
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500 transition-colors"
                    />
                  </div>
                </>
              )}

              {mode === 'verify' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text" required
                    value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full border border-gray-200 px-4 py-3 text-lg text-navy-900 outline-none focus:border-navy-500 transition-colors text-center tracking-widest"
                  />
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
                disabled={loading || (mode !== 'verify' ? (!email || !password) : !otp)}
                className="w-full bg-navy-900 text-white font-bold text-sm py-4 hover:bg-navy-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 tracking-wide"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block flex-shrink-0"
                    />
                    {mode === 'signin' ? 'Signing in…' : mode === 'signup' ? 'Creating account…' : 'Verifying…'}
                  </>
                ) : (
                  mode === 'signin' ? 'Sign In →' : mode === 'signup' ? 'Create Account →' : 'Verify OTP →'
                )}
              </motion.button>
            </form>

            {mode !== 'verify' && (
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button"
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
                    className="text-navy-900 font-bold hover:text-saffron-600 transition-colors"
                  >
                    {mode === 'signin' ? 'Create one →' : 'Sign in →'}
                  </button>
                </p>
              </div>
            )}
            {mode === 'verify' && (
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  <button type="button"
                    onClick={() => { setMode('signup'); setError(null); setInfo(null); setOtp(''); }}
                    className="text-navy-900 font-bold hover:text-saffron-600 transition-colors"
                  >
                    ← Back to signup
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Supabase note */}
          <p className="text-center text-xs text-gray-300 mt-5 px-4 leading-relaxed">
            Powered by Supabase Auth · Secured with JWT · Data never shared
          </p>

          {/* Dev tip — disable email confirmation in Supabase dashboard */}
          {import.meta.env.DEV && (
            <div className="mt-4 border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-700 leading-relaxed">
              <strong>Dev tip:</strong> If signup works but login fails with "Email not confirmed" —
              go to <strong>Supabase Dashboard → Authentication → Providers → Email → disable "Confirm email"</strong>.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
