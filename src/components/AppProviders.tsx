import { ThemeProvider } from '@/contexts/ThemeContext'
import { ConsentBanner } from '@/components/ConsentBanner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ConsentBanner />
    </ThemeProvider>
  )
}
