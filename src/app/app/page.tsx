import { AppPage } from '@/components/AppPage'
import { getEffectiveUser, getMaskedImpersonationLabel } from '@/lib/impersonation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  const impersonationLabel = isImpersonating ? getMaskedImpersonationLabel(user) : null

  return <AppPage impersonationLabel={impersonationLabel} />
}
