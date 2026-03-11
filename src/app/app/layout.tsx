import { AppProviders } from '@/components/AppProviders'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppProviders>{children}</AppProviders>
}
