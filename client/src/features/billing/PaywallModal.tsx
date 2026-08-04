import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useBillingStore, type PaywallFeature } from '../../stores/billingStore'

const COPY: Record<PaywallFeature, { title: string; body: string }> = {
  session: {
    title: "You've used your free sessions this month",
    body: 'Free includes 3 practice/interview sessions per month. Upgrade to Pro for unlimited sessions.',
  },
  solution: {
    title: 'Reference solutions are a Pro feature',
    body: 'See the full reference architecture and discuss it with the AI — available on Pro.',
  },
  cv: {
    title: 'CV-based features are Pro-only',
    body: 'Personalized problems and mock interviews built from your CV/resume — available on Pro.',
  },
}

export function PaywallModal() {
  const navigate = useNavigate()
  const { paywallOpen, paywallFeature, closePaywall } = useBillingStore()

  if (!paywallOpen || !paywallFeature) return null
  const copy = COPY[paywallFeature]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closePaywall() }}
    >
      <div className="bg-surface-sunken border border-border-default rounded-lg w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <p className="text-accent text-[11px] font-mono font-medium uppercase tracking-widest">Upgrade to Pro</p>
          <button onClick={closePaywall} className="w-6 h-6 -mt-1 -mr-1 rounded-md flex items-center justify-center text-text-subtle hover:text-text-primary hover:bg-surface-elevated transition-colors" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <h2 className="text-text-primary font-semibold text-lg mb-2">{copy.title}</h2>
        <p className="text-text-muted text-sm leading-relaxed mb-6">{copy.body}</p>

        <div className="flex gap-2">
          <button
            onClick={() => { closePaywall(); navigate('/pricing') }}
            className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors"
          >
            View Pricing
          </button>
          <button
            onClick={closePaywall}
            className="px-4 py-2.5 bg-surface-elevated hover:bg-surface border border-border-subtle text-text-secondary text-sm font-medium rounded-md transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
