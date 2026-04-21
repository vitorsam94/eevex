import { db } from '@eevex/db'
import { createHmac } from 'crypto'
import { emailQueue } from '../index'

interface TicketIssuedPayload {
  orderId: string
}

export async function handleTicketIssued({ orderId }: TicketIssuedPayload) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      participant: true,
      event: true,
      tickets: { include: { ticketType: true } },
    },
  })

  if (!order || order.status !== 'paid') return

  const secret = process.env.SERVER_TICKET_SECRET!

  for (const ticket of order.tickets) {
    if (ticket.status !== 'reserved') continue
    const sig = createHmac('sha256', secret).update(ticket.publicToken).digest('hex')
    await db.orderTicket.update({
      where: { id: ticket.id },
      data: { status: 'issued', hmacSig: sig, issuedAt: new Date() },
    })
  }

  // Queue confirmation email
  await emailQueue.add('ticket-confirmation', {
    to: order.participant.email,
    template: 'ticket-confirmation',
    data: {
      participantName: order.participant.name,
      eventName: order.event.name,
      orderId: order.id,
      magicLinkToken: order.participant.magicLinkToken,
    },
  })
}
