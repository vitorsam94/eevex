import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@eevex/db'
import { Card, KpiCard } from '@eevex/ui'

export default async function RelatoriosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const organizerId = session.user.id

  const [revenue, tickets, checkins, events, participants] = await Promise.all([
    db.order.aggregate({
      where: { event: { organizerId }, status: 'paid' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    db.orderTicket.count({
      where: { order: { event: { organizerId } }, status: { in: ['issued', 'checked_in'] } },
    }),
    db.orderTicket.count({
      where: { order: { event: { organizerId } }, status: 'checked_in' },
    }),
    db.event.count({ where: { organizerId } }),
    db.participant.count({
      where: { orders: { some: { event: { organizerId } } } },
    }),
  ])

  const totalRevenue = revenue._sum.totalAmount ?? 0
  const formatBRL = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  return (
    <div className="px-6 py-8 space-y-8">
      <h1 className="font-heading text-2xl font-semibold text-fg">Relatórios</h1>

      <div>
        <h2 className="font-heading font-medium text-base text-fg mb-4">Resumo geral</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Receita total" value={formatBRL(totalRevenue)} />
          <KpiCard label="Pedidos pagos" value={revenue._count.toLocaleString('pt-BR')} />
          <KpiCard label="Ingressos emitidos" value={tickets.toLocaleString('pt-BR')} />
          <KpiCard label="Check-ins realizados" value={checkins.toLocaleString('pt-BR')} />
          <KpiCard label="Participantes únicos" value={participants.toLocaleString('pt-BR')} />
          <KpiCard label="Total de eventos" value={events.toLocaleString('pt-BR')} />
        </div>
      </div>

      <Card className="p-6 text-center text-fg-muted text-sm">
        Gráficos detalhados em breve.
      </Card>
    </div>
  )
}
