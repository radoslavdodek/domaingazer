import 'server-only'

import type { BillingPlanPricing, CurrencyPricing } from '@/lib/billing-types'
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

function buildCurrencyPricing(
  monthlyPrice: StripePrice,
  yearlyPrice: StripePrice,
): CurrencyPricing | null {
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
}

export async function getBillingPlanPricing(): Promise<BillingPlanPricing | null> {
  const monthlyEurId = process.env.STRIPE_PRICE_MONTHLY_EUR_ID
  const yearlyEurId = process.env.STRIPE_PRICE_YEARLY_EUR_ID
  const monthlyUsdId = process.env.STRIPE_PRICE_MONTHLY_USD_ID
  const yearlyUsdId = process.env.STRIPE_PRICE_YEARLY_USD_ID

  if (!monthlyEurId || !yearlyEurId || !monthlyUsdId || !yearlyUsdId) return null

  try {
    const [monthlyEur, yearlyEur, monthlyUsd, yearlyUsd] = await Promise.all([
      getStripePrice(monthlyEurId),
      getStripePrice(yearlyEurId),
      getStripePrice(monthlyUsdId),
      getStripePrice(yearlyUsdId),
    ])

    const eur = buildCurrencyPricing(monthlyEur, yearlyEur)
    const usd = buildCurrencyPricing(monthlyUsd, yearlyUsd)

    if (!eur || !usd) return null

    return { eur, usd }
  } catch {
    return null
  }
}
