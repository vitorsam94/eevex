export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Badge, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@eevex/ui'

const STATUS_LABEL: Record<string, string> = {
  reserved: 'Reservado',
  issued: 'Emitido',
  checked_in: 'Check-in',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

const STATUS_VARIANT: Record<string, 'success' | 'warn' | 'danger' | 'default' | 'draft'> = {
  issued: 'success',
  checked_in: 'success',
  reserved: 'warn',
  cancelled: 'danger',
  refunded: 'default',
}

export default async function IngressosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const tickets = await db.orderTicket.findMany({
    where: { order: { event: { organizerId: session.user.id } } },
    orderBy: { issuedAt: 'desc' },
    take: 100,
    include: {
      participant: { select: { name: true, email: true } },
      ticketType: { select: { name: true } },
      order: { include: { event: { select: { name: true } } } },
    },
  })

  return (
    <div className="px-6 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-fg">Ingressos</h1>

      {tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-fg-muted text-sm">Nenhum ingresso emitido ainda.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium text-fg">{t.participant.name}</div>
                    <div className="text-xs text-fg-dim">{t.participant.email}</div>
                  </TableCell>
                  <TableCell className="text-fg-muted">{t.order.event.name}</TableCell>
                  <TableCell className="text-fg-muted">{t.ticketType.name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[t.status] ?? 'default'}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-fg-dim">{t.publicToken.slice(0, 12)}…</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
