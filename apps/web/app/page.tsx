import Link from 'next/link'
import { Button } from '@eevex/ui'

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Plataforma de Eventos
          </span>
        </div>
        <h1 className="font-heading text-5xl font-semibold tracking-tight text-fg max-w-xl">
          Seus eventos,{' '}
          <span className="text-primary">do ingresso ao check-in.</span>
        </h1>
        <p className="text-fg-muted text-lg max-w-md mx-auto">
          Crie, venda e opere eventos presenciais, online e híbridos com controle total.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/organizador/novo">Criar evento</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/eventos">Explorar eventos</Link>
        </Button>
      </div>
    </main>
  )
}
