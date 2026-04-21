import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPasswordHash } from '@/lib/password'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const email = url.searchParams.get('email') ?? 'admin@eevex.com'
  const password = url.searchParams.get('password') ?? 'admin123'
  const passwordHash = url.searchParams.get('passwordHash')
  const name = url.searchParams.get('name') ?? 'Admin'

  const expected = process.env.SETUP_TOKEN ?? 'eevex-setup-2024'
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const slug = (email.split('@')[0] ?? 'admin').toLowerCase().replace(/[^a-z0-9]/g, '-')
    const finalPasswordHash = passwordHash ?? (await createPasswordHash(password))

    const organizer = await db.organizer.upsert({
      where: { email },
      update: { passwordHash: finalPasswordHash, name },
      create: { email, name, slug, passwordHash: finalPasswordHash },
      select: { id: true, email: true, name: true, slug: true },
    })

    return NextResponse.json({ ok: true, organizer, passwordLength: password.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
