import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import CostComparisonSection from '../components/landing/CostComparisonSection'
import DifferentiationGrid from '../components/landing/DifferentiationGrid'
import ProofSection from '../components/landing/ProofSection'
import FAQSection from '../components/landing/FAQSection'
import FinalCTA from '../components/landing/FinalCTA'

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
      <HeroSection />
      <FeaturesSection />
      <CostComparisonSection />
      <DifferentiationGrid />
      <ProofSection />
      <FAQSection />
      <FinalCTA />
    </PageTransition>
  )
}
