import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@eevex/db'
import { randomUUID } from 'crypto'

const schema = z.object({
  eventId: z.string().uuid(),
  items: z.array(
    z.object({
      ticketTypeId: z.string().uuid(),
      batchId: z.string().uuid(),
      qty: z.number().int().min(1).max(20),
    }),
  ),
  buyer: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().regex(/^\d{11}$/),
  }),
  paymentMethod: z.enum(['card', 'pix', 'boleto']),
  ref: z.string().optional(),
  utmParams: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
    })
    .optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = schema.parse(body)

    // Upsert participant (guest-first: no password required)
    const participant = await db.participant.upsert({
      where: { email: input.buyer.email },
      create: {
        email: input.buyer.email,
        name: input.buyer.name,
        document: input.buyer.cpf,
        accountStatus: 'guest',
        magicLinkToken: randomUUID(),
        magicLinkExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      update: { name: input.buyer.name, document: input.buyer.cpf },
    })

    // Validate batches and calculate total
    const batchIds = input.items.map((i) => i.batchId)
    const batches = await db.batch.findMany({
      where: { id: { in: batchIds }, status: 'active' },
    })
    if (batches.length !== batchIds.length) {
      return NextResponse.json({ error: 'Um ou mais lotes estão indisponíveis' }, { status: 400 })
    }

    const totalAmount = input.items.reduce((sum, item) => {
      const batch = batches.find((b) => b.id === item.batchId)!
      return sum + batch.price * item.qty
    }, 0)

    // Create order with TTL reservation (15 min)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    const order = await db.order.create({
      data: {
        eventId: input.eventId,
        participantId: participant.id,
        status: 'pending_payment',
        totalAmount,
        feeAmount: Math.round(totalAmount * 0.05),
        netAmount: Math.round(totalAmount * 0.95),
        currency: 'BRL',
        expiresAt,
        utmParams: input.utmParams ?? {},
      },
    })

    // Reserve tickets (atomic decrement happens in worker after payment)
    for (const item of input.items) {
      const batch = batches.find((b) => b.id === item.batchId)!
      for (let i = 0; i < item.qty; i++) {
        await db.orderTicket.create({
          data: {
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            batchId: item.batchId,
            participantId: participant.id,
            status: 'reserved',
            publicToken: randomUUID(),
            hmacSig: '',
          },
        })
      }
    }

    return NextResponse.json({ orderId: order.id, expiresAt })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: e.errors }, { status: 422 })
    }
    console.error('[checkout/create]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
