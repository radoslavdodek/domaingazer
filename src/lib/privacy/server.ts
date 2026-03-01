import { MODEL_USAGE_RETENTION_DAYS } from './constants'
import { createAdminClient } from '@/lib/supabase/admin'

export async function purgeExpiredModelUsage() {
  const cutoff = new Date(Date.now() - MODEL_USAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const supabase: any = createAdminClient()

  const { error } = await supabase
    .from('model_usage')
    .delete()
    .lt('created_at', cutoff)

  if (error) {
    console.error('[privacy.model_usage_retention_error]', error)
  }
}
