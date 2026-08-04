import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { useBillingStore } from '../stores/billingStore'

// Lemon Squeezy checkout links, one per plan. Each attaches our internal user id
// as custom checkout data (?checkout[custom][user_id]=...) so the webhook can
// map the resulting subscription event back to this user — see
// server/src/index.ts's POST /api/billing/webhook.
function buildCheckoutUrl(base: string, googleId: string | undefined): string | null {
  if (!base || !googleId) return null
  const url = new URL(base)
  url.searchParams.set('checkout[custom][user_id]', googleId)
  return url.toString()
}

const FREE_FEATURES = ['3 practice/interview sessions per month', 'All learning rooms & quizzes', 'Live architecture canvas']
const PRO_FEATURES = ['Unlimited practice & interview sessions', 'Reference solutions & discussion', 'CV-based problems & mock interviews', 'Full session history']

export const PricingPage = () => {
  const navigate = useNavigate()
  const googleId = useUserStore(s => s.googleId)
  const { plan, fetchStatus } = useBillingStore()

  useEffect(() => { if (googleId) fetchStatus() }, [googleId, fetchStatus])

  const monthlyUrl = buildCheckoutUrl(import.meta.env.VITE_CHECKOUT_URL_MONTHLY as string ?? '', googleId)
  const quarterlyUrl = buildCheckoutUrl(import.meta.env.VITE_CHECKOUT_URL_QUARTERLY as string ?? '', googleId)

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-border-subtle bg-page/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-subtle hover:text-text-secondary text-sm transition-colors">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Back</span>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-text-primary font-semibold text-sm pointer-events-none">Pricing</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-12">
          <p className="text-accent text-[11px] font-mono font-medium mb-3 uppercase tracking-widest">Pricing</p>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Practice as much as you need to.</h1>
          <p className="text-text-muted text-sm">Simple plans. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free */}
          <div className="bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
            <p className="text-text-secondary font-semibold text-sm mb-1">Free</p>
            <div className="text-text-primary text-3xl font-bold mb-1">$0</div>
            <p className="text-text-subtle text-xs mb-6">forever</p>
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-text-muted text-sm">
                  <Check size={14} className="text-text-subtle shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <div className="py-2.5 text-center text-text-subtle text-sm font-medium border border-border-subtle rounded-md">
              {plan === 'free' ? 'Current plan' : 'Included'}
            </div>
          </div>

          {/* Pro monthly */}
          <div className="bg-surface border border-accent-soft-border rounded-lg p-6 flex flex-col relative">
            <p className="text-accent text-[11px] font-mono font-medium mb-2 uppercase tracking-widest">Most popular</p>
            <p className="text-text-secondary font-semibold text-sm mb-1">Pro</p>
            <div className="text-text-primary text-3xl font-bold mb-1">$17<span className="text-base font-medium text-text-subtle">/mo</span></div>
            <p className="text-text-subtle text-xs mb-6">billed monthly</p>
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-text-muted text-sm">
                  <Check size={14} className="text-accent shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {plan === 'pro' ? (
              <div className="py-2.5 text-center text-accent text-sm font-medium border border-accent-soft-border rounded-md">Current plan</div>
            ) : monthlyUrl ? (
              <a href={monthlyUrl} className="py-2.5 text-center bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors">Upgrade</a>
            ) : (
              <div className="py-2.5 text-center text-text-subtle text-sm font-medium border border-border-subtle rounded-md cursor-not-allowed" title="Checkout not yet configured">Coming soon</div>
            )}
          </div>

          {/* Quarterly sprint */}
          <div className="bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
            <p className="text-text-secondary font-semibold text-sm mb-1">Interview Sprint</p>
            <div className="text-text-primary text-3xl font-bold mb-1">$34<span className="text-base font-medium text-text-subtle">/3mo</span></div>
            <p className="text-text-subtle text-xs mb-6">for a focused prep push — cheaper than 3 months of Pro</p>
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-text-muted text-sm">
                  <Check size={14} className="text-text-subtle shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {quarterlyUrl ? (
              <a href={quarterlyUrl} className="py-2.5 text-center bg-surface-elevated hover:bg-surface border border-border-default text-text-primary text-sm font-semibold rounded-md transition-colors">Upgrade</a>
            ) : (
              <div className="py-2.5 text-center text-text-subtle text-sm font-medium border border-border-subtle rounded-md cursor-not-allowed" title="Checkout not yet configured">Coming soon</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
