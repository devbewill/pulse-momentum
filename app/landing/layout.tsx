import type { Metadata } from 'next'

export const metadata = {
  title: 'Pulse – Your thoughts, connected',
  description: 'Capture, merge, and rediscover your ideas with intelligent semantic connections.',
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
