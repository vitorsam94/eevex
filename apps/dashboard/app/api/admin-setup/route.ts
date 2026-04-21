import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const email = url.searchParams.get('email') ?? 'admin@eevex.com'
  const password = url.searchParams.get('password') ?? 'admin123'
  const name = url.searchParams.get('name') ?? 'Admin'

  const expected = process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production-32ch'
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const passwordHash = await hash(password, 10)
  const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

  const organizer = await db.organizer.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, name, slug, passwordHash },
    select: { id: true, email: true, name: true, slug: true },
  })

  return NextResponse.json({ ok: true, organizer, passwordLength: password.length })
}
