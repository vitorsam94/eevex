import { notFound } from 'next/navigation'
import { db } from '@eevex/db'
import { AcceptanceClient } from '@/components/acceptance-client'

interface Props {
  params: { token: string }
}

export default async function AcceptancePage({ params }: Props) {
  const log = await db.productPickupLog.findUnique({
    where: { acceptanceToken: params.token },
    include: {
      orderProduct: {
        include: {
          productSku: { include: { product: true } },
        },
      },
    },
  })

  if (!log) notFound()

  if (log.status === 'accepted') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <span className="text-5xl">✅</span>
          <p className="font-heading text-xl text-fg">Recebimento já confirmado</p>
        </div>
      </div>
    )
  }

  if (log.status === 'expired' || new Date() > log.tokenExpiresAt) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <span className="text-5xl">⏰</span>
          <p className="font-heading text-xl text-fg">Link expirado</p>
          <p className="text-fg-muted text-sm">Peça ao atendente gerar um novo QR Code.</p>
        </div>
      </div>
    )
  }

  const product = log.orderProduct.productSku.product
  const attributes = log.orderProduct.productSku.attributes as Record<string, string>
  const skuLabel = Object.entries(attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')

  return (
    <AcceptanceClient
      token={params.token}
      productName={product.name}
      skuLabel={skuLabel}
      qty={log.orderProduct.qty}
    />
  )
}
