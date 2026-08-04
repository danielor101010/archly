import { create } from 'zustand'
import { authFetch } from '../lib/api'

export type Plan = 'free' | 'pro'
export type PaywallFeature = 'session' | 'solution' | 'cv'

interface BillingState {
  plan: Plan
  sessionsUsedThisMonth: number
  sessionsLimit: number | null
  statusLoaded: boolean

  paywallOpen: boolean
  paywallFeature: PaywallFeature | null

  fetchStatus: () => void
  openPaywall: (feature: PaywallFeature) => void
  closePaywall: () => void
}

export const useBillingStore = create<BillingState>()((set) => ({
  plan: 'free',
  sessionsUsedThisMonth: 0,
  sessionsLimit: 3,
  statusLoaded: false,

  paywallOpen: false,
  paywallFeature: null,

  fetchStatus: () => {
    authFetch('/api/billing/status')
      .then(r => r.json())
      .then((data: { plan?: Plan; sessionsUsedThisMonth?: number; sessionsLimit?: number | null }) => {
        set({
          plan: data.plan ?? 'free',
          sessionsUsedThisMonth: data.sessionsUsedThisMonth ?? 0,
          sessionsLimit: data.sessionsLimit ?? null,
          statusLoaded: true,
        })
      })
      .catch(() => {})
  },

  openPaywall: (feature) => set({ paywallOpen: true, paywallFeature: feature }),
  closePaywall: () => set({ paywallOpen: false, paywallFeature: null }),
}))
