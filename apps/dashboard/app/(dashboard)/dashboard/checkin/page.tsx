export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Badge, Card, KpiCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@eevex/ui'

const RESULT_VARIANT: Record<string, 'success' | 'warn' | 'danger' | 'default'> = {
  success: 'success',
  already_used: 'warn',
  invalid: 'danger',
  cancelled: 'danger',
  type_restricted: 'warn',
}

const RESULT_LABEL: Record<string, string> = {
  success: 'Sucesso',
  already_used: 'Já usado',
  invalid: 'Inválido',
  cancelled: 'Cancelado',
  type_restricted: 'Tipo restrito',
}

export default async function CheckinPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [logs, totalSuccess, totalFail] = await Promise.all([
    db.checkinLog.findMany({
      where: { orderTicket: { order: { event: { organizerId: session.user.id } } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        orderTicket: {
          include: {
            participant: { select: { name: true } },
            order: { include: { event: { select: { name: true } } } },
          },
        },
        operator: { select: { name: true } },
        kiosk: { select: { name: true } },
      },
    }),
    db.checkinLog.count({
      where: { result: 'success', orderTicket: { order: { event: { organizerId: session.user.id } } } },
    }),
    db.checkinLog.count({
      where: { result: { not: 'success' }, orderTicket: { order: { event: { organizerId: session.user.id } } } },
    }),
  ])

  return (
    <div className="px-6 py-8 space-y-8">
      <h1 className="font-heading text-2xl font-semibold text-fg">Check-in</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Check-ins realizados" value={totalSuccess.toLocaleString('pt-BR')} />
        <KpiCard label="Tentativas inválidas" value={totalFail.toLocaleString('pt-BR')} />
        <KpiCard
          label="Taxa de sucesso"
          value={totalSuccess + totalFail > 0
            ? `${Math.round((totalSuccess / (totalSuccess + totalFail)) * 100)}%`
            : '—'}
        />
      </div>

      <div>
        <h2 className="font-heading font-medium text-lg text-fg mb-4">Últimas leituras</h2>
        {logs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-fg-muted text-sm">Nenhum check-in registrado ainda.</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Operador / Kiosk</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-fg">{l.orderTicket.participant.name}</TableCell>
                    <TableCell className="text-fg-muted">{l.orderTicket.order.event.name}</TableCell>
                    <TableCell className="text-fg-muted capitalize">{l.source}</TableCell>
                    <TableCell className="text-fg-muted">{l.operator?.name ?? l.kiosk?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={RESULT_VARIANT[l.result] ?? 'default'}>
                        {RESULT_LABEL[l.result] ?? l.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-fg-dim text-xs">
                      {new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      }).format(new Date(l.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
