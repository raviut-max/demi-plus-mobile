import type { Metadata, Viewport } from 'next'
import { Prompt } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BottomNav } from '@/components/bottom-nav'
import './globals.css'

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: 'DeMi+ | Development for Mind & Health',
  description: 'Mobile web application for diabetes self-management',
  generator: 'v0.app',
  icons: {
    icon: '/images/logo-icon.png',
    apple: '/images/logo-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#EFF6FF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} font-sans antialiased`}>
        {children}
        <BottomNav />
        <Analytics />
      </body>
    </html>
  )
}