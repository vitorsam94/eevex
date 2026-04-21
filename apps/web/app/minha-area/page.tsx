import { redirect } from 'next/navigation'
import { db } from '@eevex/db'
import { Badge, Card, Button } from '@eevex/ui'
import Link from 'next/link'
import { Download, QrCode, CalendarPlus, Wallet } from 'lucide-react'

interface Props {
  searchParams: { token?: string }
}

async function getParticipantByToken(token: string) {
  return db.participant.findFirst({
    where: {
      magicLinkToken: token,
      magicLinkExpiresAt: { gt: new Date() },
    },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          event: true,
          orderTickets: { include: { ticketType: true } },
        },
      },
    },
  })
}

const STATUS_LABEL: Record<string, string> = {
  issued: 'Emitido',
  checked_in: 'Check-in realizado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  reserved: 'Reservado',
}

const STATUS_VARIANT: Record<string, 'success' | 'warn' | 'danger' | 'default'> = {
  issued: 'success',
  checked_in: 'accent' as 'success',
  cancelled: 'danger',
  refunded: 'danger',
  reserved: 'warn',
}

export default async function MyAreaPage({ searchParams }: Props) {
  if (!searchParams.token) redirect('/')

  const participant = await getParticipantByToken(searchParams.token)
  if (!participant) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="font-heading text-xl text-fg">Link expirado</p>
          <p className="text-fg-muted text-sm">
            Este link de acesso expirou. Verifique seu e-mail para um novo link.
          </p>
        </div>
      </div>
    )
  }

  const paidOrders = participant.orders.filter((o) => o.status === 'paid')

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-fg-dim mb-1">
            Minha área
          </p>
          <h1 className="font-heading text-2xl font-semibold text-fg">{participant.name}</h1>
          <p className="text-fg-muted text-sm">{participant.email}</p>
        </div>

        {paidOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-fg-muted">Nenhum ingresso encontrado.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {paidOrders.map((order) => (
              <Card key={order.id} className="p-6 space-y-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-fg-dim mb-1">
                    Evento
                  </p>
                  <h2 className="font-heading font-medium text-fg">{order.event.name}</h2>
                  <p className="text-sm text-fg-muted">
                    {new Intl.DateTimeFormat('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: order.event.timezone,
                    }).format(new Date(order.event.startsAt))}
                  </p>
                </div>

                <div className="space-y-3">
                  {order.orderTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-lg bg-bg-elev-2 border border-border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-heading font-medium text-sm text-fg">
                            {ticket.ticketType.name}
                          </p>
                          <p className="font-mono text-xs text-fg-dim mt-0.5">
                            #{ticket.publicToken.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <Badge variant={(STATUS_VARIANT[ticket.status] as 'success' | 'warn' | 'danger' | 'default') ?? 'default'}>
                          {STATUS_LABEL[ticket.status] ?? ticket.status}
                        </Badge>
                      </div>

                      {ticket.status === 'issued' && (
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/api/tickets/${ticket.id}/pdf`} target="_blank">
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </Link>
                          </Button>
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/api/tickets/${ticket.id}/qr`}>
                              <QrCode className="h-3.5 w-3.5" />
                              QR Code
                            </Link>
                          </Button>
                          <Button asChild variant="secondary" size="sm">
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(order.event.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <CalendarPlus className="h-3.5 w-3.5" />
                              Agenda
                            </a>
                          </Button>
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/api/tickets/${ticket.id}/wallet/google`} target="_blank">
                              <Wallet className="h-3.5 w-3.5" />
                              Wallet
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
          <p className="text-sm text-fg-muted">
            Quer acesso permanente?{' '}
            <Link href="/criar-conta" className="text-primary hover:underline">
              Crie sua conta gratuita
            </Link>{' '}
            e acesse seus ingressos a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  )
}
