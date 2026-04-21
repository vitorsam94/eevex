import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@eevex/db'
import { Button, Card, Badge } from '@eevex/ui'
import { Download, CalendarPlus, Wallet, Mail, CheckCircle2, ExternalLink } from 'lucide-react'

interface Props {
  params: { orderId: string }
}

export default async function ConfirmationPage({ params }: Props) {
  const order = await db.order.findUnique({
    where: { id: params.orderId },
    include: {
      event: true,
      participant: true,
      orderTickets: {
        include: { ticketType: true },
      },
    },
  })

  if (!order) notFound()

  const isPaid = order.status === 'paid'
  const isPending = order.status === 'pending_payment'
  const loc = order.event.location as { city?: string; state?: string; address?: string } | null

  const eventDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: order.event.timezone,
  }).format(new Date(order.event.startsAt))

  const googleCalendarUrl = () => {
    const start = new Date(order.event.startsAt)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
    const end = new Date(order.event.endsAt)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
    const location = loc ? [loc.address, loc.city, loc.state].filter(Boolean).join(', ') : ''
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(order.event.name)}&dates=${start}/${end}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(`Pedido: ${order.id}`)}`
  }

  return (
    <div className="min-h-screen bg-bg flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Status header */}
        <div className="text-center space-y-3">
          {isPaid ? (
            <>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/15 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <h1 className="font-heading text-2xl font-semibold text-fg">
                Tudo certo! 🎉
              </h1>
              <p className="text-fg-muted">
                Seu ingresso foi enviado para <span className="text-fg">{order.participant.email}</span>
              </p>
            </>
          ) : isPending ? (
            <>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-warn/15 mx-auto">
                <Mail className="h-8 w-8 text-warn" />
              </div>
              <h1 className="font-heading text-2xl font-semibold text-fg">Pagamento pendente</h1>
              <p className="text-fg-muted">
                Seu ingresso será emitido assim que o pagamento for confirmado.
              </p>
            </>
          ) : null}
        </div>

        {/* Event card */}
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-fg-dim mb-1">
                Evento
              </p>
              <h2 className="font-heading font-medium text-fg">{order.event.name}</h2>
              <p className="text-sm text-fg-muted mt-1">{eventDate}</p>
              {loc?.city && (
                <p className="text-sm text-fg-dim">
                  {loc.city}
                  {loc.state ? `/${loc.state}` : ''}
                </p>
              )}
            </div>
            <Badge variant={isPaid ? 'success' : 'warn'}>
              {isPaid ? 'Pago' : 'Pendente'}
            </Badge>
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {order.orderTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">{ticket.ticketType.name}</span>
                <span className="font-mono text-xs text-fg-dim">{ticket.publicToken.slice(0, 8).toUpperCase()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        {isPaid && (
          <div className="space-y-3">
            <Button asChild variant="secondary" className="w-full" size="lg">
              <Link href={`/api/tickets/${order.orderTickets[0]?.id}/pdf`} target="_blank">
                <Download className="h-4 w-4" />
                Baixar ingresso em PDF
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="secondary">
                <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="h-4 w-4" />
                  Agenda
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/api/tickets/${order.orderTickets[0]?.id}/wallet/google`} target="_blank">
                  <Wallet className="h-4 w-4" />
                  Wallet
                </Link>
              </Button>
            </div>

            <Button asChild variant="ghost" className="w-full text-fg-muted">
              <Link href={`/minha-area?token=${order.participant.magicLinkToken}`}>
                <ExternalLink className="h-4 w-4" />
                Acessar minha área
              </Link>
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-fg-dim">
          Pedido #{order.id.slice(0, 8).toUpperCase()} · Dúvidas? Fale com o organizador do evento.
        </p>
      </div>
    </div>
  )
}
