import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import Hero from '../components/Hero'
import Trust from '../components/Trust'
import Problem from '../components/Problem'
import USP from '../components/USP'
import HowItWorks from '../components/HowItWorks'
import Demo from '../components/Demo'
import Multilingual from '../components/Multilingual'
import IPR from '../components/IPR'
import Evidence from '../components/Evidence'
import Report from '../components/Report'
import WhoItServes from '../components/WhoItServes'
import WhyIPSakti from '../components/WhyIPSakti'
import CTA from '../components/CTA'

export default function HomePage({ t }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/evaluate', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <PageTransition>
      <Hero t={t} />
      <Trust t={t} />
      <Problem t={t} />
      <USP t={t} />
      <HowItWorks t={t} />
      <Demo t={t} />
      <Multilingual t={t} />
      <IPR t={t} />
      <Evidence t={t} />
      <Report t={t} />
      <WhoItServes t={t} />
      <WhyIPSakti t={t} />
      <CTA t={t} />
    </PageTransition>
  )
}
