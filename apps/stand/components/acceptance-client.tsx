'use client'

import { useState } from 'react'
import { Button, Card } from '@eevex/ui'
import { Package, CheckCircle2 } from 'lucide-react'

interface Props {
  token: string
  productName: string
  skuLabel: string
  qty: number
}

export function AcceptanceClient({ token, productName, skuLabel, qty }: Props) {
  const [state, setState] = useState<'pending' | 'loading' | 'done' | 'error'>('pending')

  async function confirm() {
    setState('loading')
    try {
      const res = await fetch('/api/stand/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) throw new Error()
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-fg">Recebimento confirmado!</h1>
          <p className="text-fg-muted">
            {productName}
            {skuLabel ? ` · ${skuLabel}` : ''}
          </p>
          <p className="text-xs text-fg-dim">Você receberá um comprovante por e-mail.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fg-dim mb-1">
            Confirmar recebimento
          </p>
          <h1 className="font-heading text-2xl font-semibold text-fg">Você está recebendo:</h1>
        </div>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-heading font-medium text-fg">{productName}</p>
              {skuLabel && <p className="text-sm text-fg-muted">{skuLabel}</p>}
              <p className="text-xs text-fg-dim">Quantidade: {qty}</p>
            </div>
          </div>
        </Card>

        {state === 'error' && (
          <p className="text-center text-sm text-danger">
            Erro ao confirmar. Tente novamente ou fale com o atendente.
          </p>
        )}

        <Button
          onClick={confirm}
          disabled={state === 'loading'}
          className="w-full"
          size="lg"
        >
          {state === 'loading' ? 'Confirmando...' : '✓ Confirmar recebimento'}
        </Button>

        <p className="text-center text-xs text-fg-dim">
          Ao confirmar, você atesta que recebeu o item acima.
        </p>
      </div>
    </div>
  )
}
