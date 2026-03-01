export type BillingInterval = 'month' | 'year'

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
