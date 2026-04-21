import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@eevex/db'
import { createHmac } from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency: skip already-processed events
  const existing = await db.webhookEvent.findUnique({
    where: { externalEventId: event.id },
  })
  if (existing) return NextResponse.json({ ok: true })

  await db.webhookEvent.create({
    data: {
      gateway: 'stripe',
      externalEventId: event.id,
      type: event.type,
      payload: event as object,
      status: 'pending',
    },
  })

  try {
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
    } else if (event.type === 'payment_intent.payment_failed') {
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
    } else if (event.type === 'charge.refunded') {
      await handleRefunded(event.data.object as Stripe.Charge)
    }

    await db.webhookEvent.update({
      where: { externalEventId: event.id },
      data: { status: 'processed', processedAt: new Date() },
    })
  } catch (e) {
    await db.webhookEvent.update({
      where: { externalEventId: event.id },
      data: { status: 'failed' },
    })
    throw e
  }

  return NextResponse.json({ ok: true })
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata.order_id
  if (!orderId) return

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderTickets: true },
  })
  if (!order || order.status === 'paid') return

  const secret = process.env.SERVER_TICKET_SECRET!

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        orderId,
        gateway: 'stripe',
        method: 'credit_card',
        gatewayPaymentId: pi.id,
        status: 'paid',
        amount: pi.amount,
        paidAt: new Date(),
        metadata: pi as object,
      },
    })

    for (const ticket of order.orderTickets) {
      const sig = createHmac('sha256', secret).update(ticket.publicToken).digest('hex')
      await tx.orderTicket.update({
        where: { id: ticket.id },
        data: { status: 'issued', hmacSig: sig, issuedAt: new Date() },
      })
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'paid' },
    })
  })
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata.order_id
  if (!orderId) return

  await db.order.update({
    where: { id: orderId },
    data: { status: 'cancelled' },
  })
  await db.orderTicket.updateMany({
    where: { orderId },
    data: { status: 'cancelled' },
  })
}

async function handleRefunded(charge: Stripe.Charge) {
  if (!charge.payment_intent) return
  const pi = charge.payment_intent as string

  const payment = await db.payment.findFirst({ where: { gatewayPaymentId: pi } })
  if (!payment) return

  await db.$transaction([
    db.payment.update({ where: { id: payment.id }, data: { status: 'refunded', refundedAt: new Date() } }),
    db.order.update({ where: { id: payment.orderId }, data: { status: 'refunded' } }),
    db.orderTicket.updateMany({ where: { orderId: payment.orderId }, data: { status: 'cancelled' } }),
  ])
}
