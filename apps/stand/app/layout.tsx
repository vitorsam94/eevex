import type { Metadata } from 'next'
import '@eevex/ui/globals.css'

export const metadata: Metadata = {
  title: 'Eevex · Stand',
  description: 'App de entrega de itens adicionais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-fg font-body antialiased min-h-screen">{children}</body>
    </html>
  )
}
