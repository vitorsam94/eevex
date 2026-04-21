import { Card, Separator } from '@eevex/ui'
import { Calendar, MapPin } from 'lucide-react'

interface Props {
  event: { name: string; startsAt: Date; timezone: string; location: unknown }
  items: Array<{
    ticketType: { name: string }
    batch: { name: string; price: number }
    qty: number
  }>
}

function formatPrice(cents: number) {
  if (cents === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export function CheckoutSummary({ event, items }: Props) {
  const loc = event.location as { city?: string; state?: string; address?: string } | null
  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: event.timezone,
  }).format(new Date(event.startsAt))

  const subtotal = items.reduce((s, i) => s + i.batch.price * i.qty, 0)

  return (
    <Card className="p-6 space-y-4 sticky top-6">
      <div>
        <h2 className="font-heading font-medium text-lg text-fg">{event.name}</h2>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-fg-muted">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{dateStr}</span>
          </div>
          {loc?.city && (
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>
                {loc.address ? `${loc.address}, ` : ''}
                {loc.city}
                {loc.state ? `/${loc.state}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-fg truncate">{item.ticketType.name}</p>
              <p className="text-xs text-fg-dim">{item.batch.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-mono text-fg">{formatPrice(item.batch.price * item.qty)}</p>
              <p className="text-xs text-fg-dim">
                {item.qty}× {formatPrice(item.batch.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">Total</span>
        <span className="font-heading font-semibold text-xl text-fg">{formatPrice(subtotal)}</span>
      </div>

      <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
        <p className="text-xs text-accent">
          Ingressos enviados por e-mail após confirmação do pagamento.
        </p>
      </div>
    </Card>
  )
}
