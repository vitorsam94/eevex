import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@eevex/db'

const schema = z.object({ token: z.string().uuid() })

export async function POST(req: NextRequest) {
  try {
    const { token } = schema.parse(await req.json())

    const log = await db.productPickupLog.findUnique({
      where: { acceptanceToken: token },
    })

    if (!log) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    if (log.status === 'accepted') return NextResponse.json({ error: 'Já confirmado' }, { status: 409 })
    if (log.status === 'expired' || new Date() > log.tokenExpiresAt) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 410 })
    }

    await db.$transaction([
      db.productPickupLog.update({
        where: { acceptanceToken: token },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          participantIp: req.headers.get('x-forwarded-for') ?? req.ip ?? null,
          participantUa: req.headers.get('user-agent') ?? null,
        },
      }),
      db.orderProduct.update({
        where: { id: log.orderProductId },
        data: { status: 'picked_up', pickedUpAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
    console.error('[stand/accept]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
