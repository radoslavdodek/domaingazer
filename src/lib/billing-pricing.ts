import 'server-only'

import type { BillingPlanPricing } from '@/lib/billing-types'
import { getStripePrice, type StripePrice } from '@/lib/stripe'

function getBillingMonths(price: StripePrice) {
  const interval = price.recurring?.interval
  const intervalCount = price.recurring?.interval_count ?? 1

  if (!Number.isFinite(intervalCount) || intervalCount <= 0) return null
  if (interval === 'month') return intervalCount
  if (interval === 'year') return intervalCount * 12
  return null
}

function formatCurrency(amountInMinorUnits: number, currency: string) {
  const amount = amountInMinorUnits / 100
  const hasFraction = !Number.isInteger(amount)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export async function getBillingPlanPricing(): Promise<BillingPlanPricing | null> {
  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY_ID
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY_ID

  if (!monthlyPriceId || !yearlyPriceId) return null

  try {
    const [monthlyPrice, yearlyPrice] = await Promise.all([
      getStripePrice(monthlyPriceId),
      getStripePrice(yearlyPriceId),
    ])

    const monthlyBillingMonths = getBillingMonths(monthlyPrice)
    const yearlyBillingMonths = getBillingMonths(yearlyPrice)

    if (
      monthlyPrice.unit_amount === null
      || yearlyPrice.unit_amount === null
      || !monthlyBillingMonths
      || !yearlyBillingMonths
    ) {
      return null
    }

    return {
      monthly: formatCurrency(monthlyPrice.unit_amount / monthlyBillingMonths, monthlyPrice.currency),
      yearlyPerMonth: formatCurrency(yearlyPrice.unit_amount / yearlyBillingMonths, yearlyPrice.currency),
      yearlyBillingNote: `${formatCurrency(yearlyPrice.unit_amount, yearlyPrice.currency)} billed yearly`,
    }
  } catch {
    return null
  }
}
