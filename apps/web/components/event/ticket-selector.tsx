'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Separator, Badge } from '@eevex/ui'
import { Minus, Plus, ShoppingCart } from 'lucide-react'

interface Batch {
  id: string
  price: number
  name: string
}

interface TicketType {
  id: string
  name: string
  description: string | null
  type: string
  availableQty: number
  maxPerBuyer: number | null
  batches: Batch[]
}

interface TicketSelectorProps {
  ticketTypes: TicketType[]
  eventSlug: string
  campaignParams: Record<string, string | undefined>
}

function formatPrice(cents: number) {
  if (cents === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export function TicketSelector({ ticketTypes, eventSlug, campaignParams }: TicketSelectorProps) {
  const router = useRouter()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const total = ticketTypes.reduce((sum, t) => {
    const qty = quantities[t.id] ?? 0
    const price = t.batches[0]?.price ?? 0
    return sum + qty * price
  }, 0)

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)

  function setQty(id: string, delta: number) {
    setQuantities((prev) => {
      const current = prev[id] ?? 0
      const ticket = ticketTypes.find((t) => t.id === id)!
      const max = Math.min(ticket.maxPerBuyer ?? 10, ticket.availableQty)
      const next = Math.max(0, Math.min(max, current + delta))
      return { ...prev, [id]: next }
    })
  }

  function handleCheckout() {
    const params = new URLSearchParams()
    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty > 0) params.set(`t_${id}`, String(qty))
    })
    if (campaignParams.ref) params.set('ref', campaignParams.ref)
    if (campaignParams.utm_source) params.set('utm_source', campaignParams.utm_source)
    if (campaignParams.utm_medium) params.set('utm_medium', campaignParams.utm_medium)
    if (campaignParams.utm_campaign) params.set('utm_campaign', campaignParams.utm_campaign)
    router.push(`/eventos/${eventSlug}/checkout?${params.toString()}`)
  }

  return (
    <Card className="sticky top-6 p-6 space-y-4">
      <h2 className="font-heading font-medium text-lg text-fg">Ingressos</h2>

      <div className="space-y-3">
        {ticketTypes.map((ticket) => {
          const batch = ticket.batches[0]
          const qty = quantities[ticket.id] ?? 0
          const isSoldOut = ticket.availableQty === 0
          const isComplementary = ticket.type === 'complementary'

          return (
            <div
              key={ticket.id}
              className="rounded-lg bg-bg-elev-2 border border-border p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-medium text-sm text-fg">{ticket.name}</span>
                    {isComplementary && <Badge variant="warn">Complementar</Badge>}
                    {isSoldOut && <Badge variant="danger">Esgotado</Badge>}
                  </div>
                  {ticket.description && (
                    <p className="text-xs text-fg-dim mt-0.5 line-clamp-2">{ticket.description}</p>
                  )}
                </div>
                <span className="font-mono text-sm font-medium text-fg shrink-0">
                  {batch ? formatPrice(batch.price) : '—'}
                </span>
              </div>

              {!isSoldOut && batch && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(ticket.id, -1)}
                    disabled={qty === 0}
                    className="h-7 w-7 rounded-md border border-border bg-bg-elev flex items-center justify-center text-fg-muted hover:text-fg hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono text-sm text-fg w-4 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(ticket.id, 1)}
                    disabled={qty >= Math.min(ticket.maxPerBuyer ?? 10, ticket.availableQty)}
                    className="h-7 w-7 rounded-md border border-border bg-bg-elev flex items-center justify-center text-fg-muted hover:text-fg hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {totalItems > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted">Total</span>
            <span className="font-heading font-semibold text-lg text-fg">
              {formatPrice(total)}
            </span>
          </div>
          <Button onClick={handleCheckout} className="w-full" size="lg">
            <ShoppingCart className="h-4 w-4" />
            Ir para o checkout
          </Button>
        </>
      )}

      {totalItems === 0 && (
        <p className="text-center text-xs text-fg-dim pt-2">
          Selecione pelo menos um ingresso para continuar
        </p>
      )}
    </Card>
  )
}
