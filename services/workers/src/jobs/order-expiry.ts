import { db } from '@eevex/db'
import pino from 'pino'

const log = pino()

interface OrderExpiryPayload {
  orderId: string
}

export async function handleOrderExpiry({ orderId }: OrderExpiryPayload) {
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) return
  if (order.status !== 'pending_payment') {
    log.info({ orderId }, 'Order expiry skipped — already resolved')
    return
  }

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: 'cancelled' } }),
    db.orderTicket.updateMany({ where: { orderId }, data: { status: 'cancelled' } }),
  ])

  log.info({ orderId }, 'Order expired — vagas liberadas')
}
