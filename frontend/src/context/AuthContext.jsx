import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { setAuthToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Load existing session on mount
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) console.error('getSession error:', error.message)
        setSession(session ?? null)
        setUser(session?.user ?? null)
        setAuthToken(session?.access_token ?? null)
      })
      .catch(err => console.error('getSession threw:', err))
      .finally(() => setLoading(false))

    // 2. React to sign-in / sign-out / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      setUser(session?.user ?? null)
      setAuthToken(session?.access_token ?? null)
      // Ensure loading is cleared after first auth event too
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp  = (email, password) => supabase.auth.signUp({ email, password })
  const signOut = ()                => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
