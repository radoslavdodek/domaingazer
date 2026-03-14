import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminFeedbackPage } from './AdminFeedbackPage'

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    redirect('/')
  }

  return <AdminFeedbackPage />
}
