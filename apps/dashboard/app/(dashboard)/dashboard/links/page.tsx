import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@eevex/db'
import { Badge, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@eevex/ui'

export default async function LinksPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const links = await db.purchaseLink.findMany({
    where: { event: { organizerId: session.user.id } },
    orderBy: { createdAt: 'desc' },
    include: { event: { select: { name: true } }, _count: { select: { orders: true } } },
  })

  return (
    <div className="px-6 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-fg">Links de compra</h1>

      {links.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-fg-muted text-sm">Nenhum link criado ainda.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-fg">{l.name}</TableCell>
                  <TableCell className="text-fg-muted">{l.event.name}</TableCell>
                  <TableCell className="font-mono text-xs text-fg-dim">/{l.slug}</TableCell>
                  <TableCell className="text-fg-muted">{l._count.orders}</TableCell>
                  <TableCell>
                    <Badge variant={l.isActive ? 'success' : 'default'}>
                      {l.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
