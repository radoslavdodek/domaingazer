import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminUsagePage } from './AdminUsagePage'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    redirect('/')
  }

  return <AdminUsagePage />
}
