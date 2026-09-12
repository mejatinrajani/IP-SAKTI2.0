import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Still checking session — show minimal spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Verifying session…</p>
        </div>
      </div>
    )
  }

  // Not logged in → send to auth page, remember where they wanted to go
  if (!user) return <Navigate to="/auth" replace state={{ from: '/evaluate' }} />

  return children
}
