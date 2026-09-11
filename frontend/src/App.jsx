import { useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { translations } from './translations'
import { AuthProvider } from './context/AuthContext'
import UtilityBar from './components/UtilityBar'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage         from './pages/HomePage'
import AboutPage        from './pages/AboutPage'
import HowItWorksPage   from './pages/HowItWorksPage'
import CapabilitiesPage from './pages/CapabilitiesPage'
import EvidencePage     from './pages/EvidencePage'
import ResourcesPage    from './pages/ResourcesPage'
import Dashboard        from './pages/Dashboard'
import AuthPage         from './pages/AuthPage'

function LandingLayout({ t, lang, setLang }) {
  return (
    <div className="min-h-screen bg-white text-navy-900 font-sans flex flex-col">
      <UtilityBar t={t} lang={lang} setLang={setLang} />
      <Header t={t} lang={lang} setLang={setLang} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer t={t} />
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState('en')
  const t = translations[lang] || translations.en

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<LandingLayout t={t} lang={lang} setLang={setLang} />}>
            <Route path="/"             element={<HomePage         t={t} />} />
            <Route path="/about"        element={<AboutPage        t={t} />} />
            <Route path="/how-it-works" element={<HowItWorksPage   t={t} />} />
            <Route path="/capabilities" element={<CapabilitiesPage t={t} />} />
            <Route path="/evidence"     element={<EvidencePage     t={t} />} />
            <Route path="/resources"    element={<ResourcesPage    t={t} />} />
            <Route path="/auth"         element={<AuthPage />} />
          </Route>
          
          <Route path="/evaluate" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
