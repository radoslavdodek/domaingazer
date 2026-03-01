import { createClient } from '@/lib/supabase/server'
import { AppPage } from '@/components/AppPage'
import { LandingPage } from '@/components/LandingPage'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? <AppPage /> : <LandingPage />
}
