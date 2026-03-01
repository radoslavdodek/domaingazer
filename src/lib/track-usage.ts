import { createClient } from '@/lib/supabase/server'
import type { AiUsage } from './openai'

export function trackUsage(
  userId: string,
  userEmail: string,
  feature: 'generateDomains' | 'explain',
  usage: AiUsage
) {
  // Intentionally no await — don't block the main response
  createClient()
    .from('model_usage')
    .insert({
      user_id: userId,
      user_email: userEmail,
      provider: usage.provider,
      model: usage.model,
      feature,
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
    })
    .then(
      () => {},
      (err) => console.error('[track_usage.error]', err)
    )
}
