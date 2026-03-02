export type BillingInterval = 'month' | 'year'

export type BillingCurrency = 'eur' | 'usd'

export interface CurrencyPricing {
  monthly: string | null
  yearlyPerMonth: string | null
  yearlyBillingNote: string | null
}

export interface BillingPlanPricing {
  eur: CurrencyPricing
  usd: CurrencyPricing
}

export interface BillingStatusResponse {
  isSubscribed: boolean
  subscriptionStatus: string | null
  planInterval: BillingInterval | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  freeCreditsTotal: number
  freeCreditsUsed: number
  freeCreditsRemaining: number
  usagePercent: number
}
