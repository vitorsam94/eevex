export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button, Card } from '@eevex/ui'

function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function toDateFromLocal(dateTimeLocal: string) {
  const date = new Date(dateTimeLocal)
  if (Number.isNaN(date.getTime())) return null
  return date
}

async function createEventAction(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const organizerId = session.user.id
  const name = String(formData.get('name') ?? '').trim()
  const startsAtRaw = String(formData.get('startsAt') ?? '').trim()
  const endsAtRaw = String(formData.get('endsAt') ?? '').trim()
  const timezone = String(formData.get('timezone') ?? 'America/Sao_Paulo').trim() || 'America/Sao_Paulo'
  const capacityRaw = String(formData.get('capacity') ?? '').trim()

  if (!name || !startsAtRaw || !endsAtRaw) {
    redirect('/dashboard/eventos/novo?error=missing_fields')
  }

  const startsAt = toDateFromLocal(startsAtRaw)
  const endsAt = toDateFromLocal(endsAtRaw)

  if (!startsAt || !endsAt || endsAt <= startsAt) {
    redirect('/dashboard/eventos/novo?error=invalid_dates')
  }

  const parsedCapacity = capacityRaw ? Number.parseInt(capacityRaw, 10) : NaN
  if (capacityRaw && (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0)) {
    redirect('/dashboard/eventos/novo?error=invalid_capacity')
  }
  const capacity = capacityRaw ? parsedCapacity : null

  const baseSlug = slugify(name) || 'evento'
  let slug = `${baseSlug}-${Date.now().toString(36)}`
  let attempt = 0

  // Guarantee unique slug even on concurrent event creation.
  while (attempt < 5) {
    const exists = await db.event.findUnique({ where: { slug }, select: { id: true } })
    if (!exists) break
    attempt += 1
    slug = `${baseSlug}-${Date.now().toString(36)}-${attempt}`
  }

  await db.event.create({
    data: {
      organizerId,
      name,
      slug,
      startsAt,
      endsAt,
      timezone,
      ...(capacity ? { capacity } : {}),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/eventos')
  redirect('/dashboard/eventos')
}

export default async function NewEventPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const error = searchParams?.error
  const errorMessage =
    error === 'invalid_dates'
      ? 'A data de fim precisa ser maior que a data de início.'
      : error === 'invalid_capacity'
        ? 'Capacidade inválida. Use um número maior que zero.'
        : error === 'missing_fields'
          ? 'Preencha os campos obrigatórios.'
          : null

  return (
    <div className="px-6 py-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-fg">Novo evento</h1>
        <Button asChild variant="ghost">
          <Link href="/dashboard/eventos">Voltar</Link>
        </Button>
      </div>

      <Card className="p-6">
        <form action={createEventAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm text-fg-muted">
              Nome do evento *
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-primary"
              placeholder="Ex.: Conferência Eevex 2026"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="startsAt" className="text-sm text-fg-muted">
                Início *
              </label>
              <input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="endsAt" className="text-sm text-fg-muted">
                Fim *
              </label>
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="timezone" className="text-sm text-fg-muted">
                Fuso horário
              </label>
              <input
                id="timezone"
                name="timezone"
                defaultValue="America/Sao_Paulo"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="capacity" className="text-sm text-fg-muted">
                Capacidade
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-primary"
                placeholder="Ex.: 500"
              />
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}

          <div className="pt-2">
            <Button type="submit">Criar evento</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
