import type { Metadata } from 'next'
import '@eevex/ui/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: { default: 'Eevex Dashboard', template: '%s · Eevex' },
  description: 'Painel do organizador Eevex',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-fg font-body antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
