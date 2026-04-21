export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Badge, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@eevex/ui'

export default async function ProdutosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const products = await db.product.findMany({
    where: { event: { organizerId: session.user.id } },
    orderBy: { event: { name: 'asc' } },
    include: {
      event: { select: { name: true } },
      skus: { select: { price: true, stockQty: true, reservedQty: true } },
    },
  })

  return (
    <div className="px-6 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-fg">Produtos adicionais</h1>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-fg-muted text-sm">Nenhum produto criado ainda.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>SKUs</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const totalStock = p.skus.reduce((s, sku) => s + sku.stockQty, 0)
                const totalReserved = p.skus.reduce((s, sku) => s + sku.reservedQty, 0)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-fg">{p.name}</TableCell>
                    <TableCell className="text-fg-muted">{p.event.name}</TableCell>
                    <TableCell className="text-fg-muted">{p.skus.length}</TableCell>
                    <TableCell className="text-fg-muted">{totalStock - totalReserved} disponíveis</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? 'success' : 'default'}>
                        {p.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
