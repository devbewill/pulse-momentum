import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider'
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister'
import { AppShell } from '@/components/layout/AppShell'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Pulse – Your thoughts, connected',
  description: 'A single infinite stream of thoughts that surfaces relevant context as you write.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Pulse' },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <body className={`${geist.variable} font-sans h-full bg-zinc-50 text-zinc-900 antialiased`}>
        <ConvexClientProvider>
          <ServiceWorkerRegister />
          <AppShell>{children}</AppShell>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
