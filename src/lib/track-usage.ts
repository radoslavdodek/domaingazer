import { createClient } from '@/lib/supabase/server'
import aiProvidersConfig from '@/config/ai-providers.json'
import type { AiUsage } from './openai'

type ModelPricing = { promptPer1M: number; completionPer1M: number }
type PricingConfig = { modelPricing?: Record<string, ModelPricing> }

function computeCost(model: string, promptTokens: number, completionTokens: number): number | null {
  const pricing = (aiProvidersConfig as PricingConfig).modelPricing?.[model]
  if (!pricing) return null
  return (promptTokens * pricing.promptPer1M + completionTokens * pricing.completionPer1M) / 1_000_000
}

export function trackUsage(
  userId: string,
  userEmail: string,
  feature: 'generateDomains' | 'explain',
  usage: AiUsage
) {
  const cost_usd = computeCost(usage.model, usage.promptTokens, usage.completionTokens)

  // Intentionally no await — don't block the main response
  void (async () => {
    const supabase = await createClient()

    await supabase.from('model_usage').insert({
      user_id: userId,
      user_email: userEmail,
      provider: usage.provider,
      model: usage.model,
      feature,
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
      cost_usd,
    })
  })().catch((err) => console.error('[track_usage.error]', err))
}
