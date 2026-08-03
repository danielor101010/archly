import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useUserStore } from '../stores/userStore'
import { Nav } from './landing/Nav'
import { Hero } from './landing/Hero'
import { ProductPreview } from './landing/ProductPreview'
import { Features } from './landing/Features'
import { ProblemsPreview } from './landing/ProblemsPreview'
import { CvCta } from './landing/CvCta'
import { Footer } from './landing/Footer'
import { SignInModal } from './landing/SignInModal'

export const Landing = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const name   = useUserStore(s => s.name)
  const avatar = useUserStore(s => s.avatar)
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if ((location.state as { requireSignIn?: boolean } | null)?.requireSignIn) {
      setShowSignIn(true)
    }
  }, [location.state])

  const goOrSignIn = (path: string) => name ? navigate(path) : setShowSignIn(true)

  return (
    <div className="min-h-screen bg-page text-text-primary overflow-x-hidden">
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />

      <Nav
        name={name}
        avatar={avatar}
        onProfile={() => goOrSignIn('/dashboard')}
        onPrimary={() => goOrSignIn('/practice')}
      />

      <section className="relative z-10 px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <Hero onStart={() => goOrSignIn('/practice')} onCv={() => goOrSignIn('/cv-analysis')} />
          <ProductPreview />
        </div>
      </section>

      <Features />
      <ProblemsPreview onOpen={(id) => goOrSignIn(id ? `/practice/${id}` : '/practice')} />
      <CvCta onClick={() => goOrSignIn('/cv-analysis')} />
      <Footer />
    </div>
  )
}
