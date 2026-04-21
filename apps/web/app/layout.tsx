import type { Metadata } from 'next'
import '@eevex/ui/globals.css'

export const metadata: Metadata = {
  title: { default: 'Eevex', template: '%s · Eevex' },
  description: 'Plataforma de gestão de eventos e venda de ingressos',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://eevex.com.br'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-fg font-body antialiased min-h-screen">{children}</body>
    </html>
  )
}
