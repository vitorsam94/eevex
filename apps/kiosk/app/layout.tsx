import type { Metadata } from 'next'
import '@eevex/ui/globals.css'

export const metadata: Metadata = {
  title: 'Eevex · Totem',
  description: 'Check-in autoatendimento',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-fg font-body antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  )
}
