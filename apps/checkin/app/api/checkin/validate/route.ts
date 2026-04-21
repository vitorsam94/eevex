import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@eevex/db'
import { createHmac, timingSafeEqual } from 'crypto'

const schema = z.object({
  token: z.string().min(1),
  operatorId: z.string().uuid().optional(),
  kioskId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, operatorId, kioskId } = schema.parse(body)

    // token format: "{public_token}.{sig[0:16]}"
    const [publicToken, sigTruncated] = token.split('.')
    if (!publicToken || !sigTruncated) {
      return NextResponse.json({ status: 'invalid' })
    }

    const ticket = await db.orderTicket.findUnique({
      where: { publicToken },
      include: {
        ticketType: true,
        order: { include: { participant: true } },
      },
    })

    if (!ticket) return NextResponse.json({ status: 'invalid' })

    // Verify HMAC
    const secret = process.env.SERVER_TICKET_SECRET!
    const expectedSig = createHmac('sha256', secret).update(publicToken).digest('hex')
    const sigBuffer = Buffer.from(sigTruncated.padEnd(64, '0'))
    const expectedBuffer = Buffer.from(expectedSig.slice(0, 16).padEnd(64, '0'))
    const hmacValid = timingSafeEqual(sigBuffer, expectedBuffer)

    if (!hmacValid) return NextResponse.json({ status: 'invalid' })

    if (ticket.status === 'checked_in') {
      return NextResponse.json({
        status: 'already_used',
        checkedInAt: ticket.checkedInAt?.toISOString(),
      })
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return NextResponse.json({ status: 'cancelled' })
    }

    if (ticket.status !== 'issued') {
      return NextResponse.json({ status: 'invalid' })
    }

    // Atomic check-in (race condition protection)
    const updated = await db.orderTicket.updateMany({
      where: { id: ticket.id, status: 'issued' },
      data: { status: 'checked_in', checkedInAt: new Date() },
    })

    if (updated.count === 0) {
      return NextResponse.json({ status: 'already_used' })
    }

    // Log the check-in
    await db.checkinLog.create({
      data: {
        orderTicketId: ticket.id,
        operatorId: operatorId ?? null,
        kioskId: kioskId ?? null,
        source: kioskId ? 'kiosk' : 'receptionist',
        action: 'checkin',
        result: 'success',
      },
    })

    return NextResponse.json({
      status: 'success',
      participant: {
        name: ticket.order.participant.name,
        ticketType: ticket.ticketType.name,
        orderCode: ticket.order.id.slice(0, 8).toUpperCase(),
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ status: 'invalid' })
    }
    console.error('[checkin/validate]', e)
    return NextResponse.json({ status: 'invalid' }, { status: 500 })
  }
}
