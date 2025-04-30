import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Roulette Simulator',
  description: 'A web-based roulette simulator with customizable parameters and analytics',
  keywords: 'roulette, simulator, gambling, statistics, analytics, probability',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="container mx-auto px-4 max-w-7xl">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
