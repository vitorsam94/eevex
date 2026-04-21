import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@eevex/db'
import { randomUUID, createHmac } from 'crypto'
import QRCode from 'qrcode'

const schema = z.object({ orderProductId: z.string().uuid() })

export async function POST(req: NextRequest) {
  try {
    const { orderProductId } = schema.parse(await req.json())

    const orderProduct = await db.orderProduct.findUnique({
      where: { id: orderProductId },
    })
    if (!orderProduct || orderProduct.status !== 'pending_pickup') {
      return NextResponse.json({ error: 'Item não disponível' }, { status: 400 })
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const hmac = createHmac('sha256', process.env.SERVER_TICKET_SECRET!)
      .update(token)
      .digest('hex')

    await db.productPickupLog.create({
      data: {
        orderProductId,
        acceptanceToken: token,
        tokenExpiresAt: expiresAt,
        status: 'pending',
      },
    })

    const acceptanceUrl = `${process.env.NEXT_PUBLIC_STAND_URL}/aceite/${token}`
    const qrDataUrl = await QRCode.toDataURL(acceptanceUrl, { width: 300 })

    return NextResponse.json({ token, qrDataUrl, expiresAt, hmac: hmac.slice(0, 8) })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
