import { Layers } from 'lucide-react'
import { GoogleSignIn } from '../../components/GoogleSignIn'

export function SignedOutView() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <Layers size={32} strokeWidth={1.75} className="text-accent mb-5 mx-auto" />
        <h1 className="text-3xl font-bold text-text-primary mb-2">Arch<span className="text-accent">ly</span></h1>
        <p className="text-text-muted text-sm mb-8">Sign in to track your progress across all topics</p>
        <GoogleSignIn />
      </div>
    </div>
  )
}
