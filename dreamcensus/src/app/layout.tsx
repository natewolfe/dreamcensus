import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { AlarmProvider } from '@/providers/alarm-provider'
import { VisualPreferencesProvider } from '@/providers/visual-preferences-provider'

export const metadata: Metadata = {
  title: 'Dream Census',
  description: 'A ritual-first dream reflection app with research-grade data collection',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0c0e1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <VisualPreferencesProvider>
            <ToastProvider>
              <AlarmProvider>
                <a href="#main-content" className="skip-link">
                  Skip to content
                </a>
                {children}
              </AlarmProvider>
            </ToastProvider>
          </VisualPreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

