import { AppProviders } from '@/components/AppProviders'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppProviders>{children}</AppProviders>
}
