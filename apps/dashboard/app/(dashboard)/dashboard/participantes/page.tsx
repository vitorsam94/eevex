import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@eevex/db'
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@eevex/ui'

export default async function ParticipantesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const participants = await db.participant.findMany({
    where: { orders: { some: { event: { organizerId: session.user.id } } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { _count: { select: { orders: true, orderTickets: true } } },
  })

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-fg">Participantes</h1>
        <span className="text-sm text-fg-muted">{participants.length} participantes</span>
      </div>

      {participants.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-fg-muted text-sm">Nenhum participante encontrado.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Ingressos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-fg">{p.name}</TableCell>
                  <TableCell className="text-fg-muted">{p.email}</TableCell>
                  <TableCell className="text-fg-muted">{p.phone ?? '—'}</TableCell>
                  <TableCell className="text-fg-muted">{p._count.orders}</TableCell>
                  <TableCell className="text-fg-muted">{p._count.orderTickets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
