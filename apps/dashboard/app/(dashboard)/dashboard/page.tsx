import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@eevex/db'
import { KpiCard, Card, Badge } from '@eevex/ui'
import Link from 'next/link'
import { Button } from '@eevex/ui'
import { Plus } from 'lucide-react'

async function getStats(organizerId: string) {
  const [totalRevenue, totalTickets, totalCheckins, upcomingEvents] = await Promise.all([
    db.order.aggregate({
      where: { event: { organizerId }, status: 'paid' },
      _sum: { totalAmount: true },
    }),
    db.orderTicket.count({
      where: { order: { event: { organizerId } }, status: { in: ['issued', 'checked_in'] } },
    }),
    db.orderTicket.count({
      where: { order: { event: { organizerId } }, status: 'checked_in' },
    }),
    db.event.findMany({
      where: { organizerId, status: 'published', startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: 5,
      include: {
        _count: { select: { ticketTypes: true } },
        orders: { where: { status: 'paid' }, select: { totalAmount: true } },
      },
    }),
  ])

  return { totalRevenue, totalTickets, totalCheckins, upcomingEvents }
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const organizerId = session.user.id

  const { totalRevenue, totalTickets, totalCheckins, upcomingEvents } = await getStats(organizerId)

  const revenue = totalRevenue._sum.totalAmount ?? 0

  return (
    <div className="px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-fg">Visão geral</h1>
          <p className="text-fg-muted text-sm mt-0.5">Bem-vindo ao painel Eevex</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/eventos/novo">
            <Plus className="h-4 w-4" />
            Novo evento
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Receita total"
          value={formatBRL(revenue)}
          delta="+12% vs. mês passado"
        />
        <KpiCard
          label="Ingressos emitidos"
          value={totalTickets.toLocaleString('pt-BR')}
        />
        <KpiCard
          label="Check-ins realizados"
          value={totalCheckins.toLocaleString('pt-BR')}
        />
        <KpiCard
          label="Taxa de comparecimento"
          value={totalTickets > 0 ? `${Math.round((totalCheckins / totalTickets) * 100)}%` : '—'}
        />
      </div>

      <div>
        <h2 className="font-heading font-medium text-lg text-fg mb-4">Próximos eventos</h2>
        {upcomingEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-fg-muted text-sm mb-4">Nenhum evento publicado.</p>
            <Button asChild>
              <Link href="/dashboard/eventos/novo">
                <Plus className="h-4 w-4" />
                Criar primeiro evento
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const revenue = event.orders.reduce((s, o) => s + o.totalAmount, 0)
              return (
                <Card key={event.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/dashboard/eventos/${event.id}`}
                          className="font-heading font-medium text-fg hover:text-primary transition-colors"
                        >
                          {event.name}
                        </Link>
                        <Badge variant="live">Publicado</Badge>
                      </div>
                      <p className="text-xs text-fg-dim">
                        {new Intl.DateTimeFormat('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: event.timezone,
                        }).format(new Date(event.startsAt))}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-medium text-fg">{formatBRL(revenue)}</p>
                      <p className="text-xs text-fg-dim">{event.orders.length} pedidos</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
