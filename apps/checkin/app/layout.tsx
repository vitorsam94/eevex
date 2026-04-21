import type { Metadata } from 'next'
import '@eevex/ui/globals.css'

export const metadata: Metadata = {
  title: 'Eevex Check-in',
  description: 'App de check-in para recepcionistas',
  manifest: '/manifest.json',
  themeColor: '#0A0A0F',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-fg font-body antialiased min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}
