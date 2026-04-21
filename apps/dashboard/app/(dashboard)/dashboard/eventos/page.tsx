export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Button, Badge, Card } from '@eevex/ui'
import { Plus, Calendar, Users } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'success' | 'warn' | 'danger' | 'default' | 'draft'> = {
  published: 'success',
  draft: 'draft',
  paused: 'warn',
  ended: 'default',
  archived: 'default',
}

const STATUS_LABEL: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  paused: 'Pausado',
  ended: 'Encerrado',
  archived: 'Arquivado',
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const organizerId = session.user.id

  const events = await db.event.findMany({
    where: { organizerId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { ticketTypes: true } },
      orders: { where: { status: 'paid' }, select: { totalAmount: true } },
    },
  })

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-fg">Eventos</h1>
        <Button asChild>
          <Link href="/dashboard/eventos/novo">
            <Plus className="h-4 w-4" />
            Novo evento
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Calendar className="h-10 w-10 text-fg-dim mx-auto" />
          <p className="text-fg-muted">Nenhum evento criado ainda.</p>
          <Button asChild>
            <Link href="/dashboard/eventos/novo">
              <Plus className="h-4 w-4" />
              Criar evento
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const revenue = event.orders.reduce((s, o) => s + o.totalAmount, 0)
            return (
              <Card key={event.id} className="p-5 hover:border-border-strong transition-colors">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link
                        href={`/dashboard/eventos/${event.id}`}
                        className="font-heading font-medium text-fg hover:text-primary transition-colors"
                      >
                        {event.name}
                      </Link>
                      <Badge variant={(STATUS_VARIANT[event.status] as 'success' | 'warn' | 'danger' | 'default') ?? 'default'}>
                        {STATUS_LABEL[event.status] ?? event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-fg-dim">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Intl.DateTimeFormat('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: event.timezone,
                        }).format(new Date(event.startsAt))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.capacity?.toLocaleString('pt-BR') ?? '∞'} vagas
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-medium text-fg">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue / 100)}
                    </p>
                    <p className="text-xs text-fg-dim">{event.orders.length} vendas</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
