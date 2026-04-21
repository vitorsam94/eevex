import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@eevex/db'
import { Card } from '@eevex/ui'

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const organizer = await db.organizer.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, slug: true, plan: true, createdAt: true },
  })

  if (!organizer) redirect('/login')

  const PLAN_LABEL: Record<string, string> = {
    free: 'Gratuito',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-fg">Configurações</h1>

      <Card className="p-6 space-y-4">
        <h2 className="font-heading font-medium text-fg">Conta</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-fg-muted">Nome</span>
            <span className="text-fg font-medium">{organizer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">E-mail</span>
            <span className="text-fg">{organizer.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Slug</span>
            <span className="font-mono text-fg-dim">{organizer.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Plano</span>
            <span className="text-fg">{PLAN_LABEL[organizer.plan] ?? organizer.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Membro desde</span>
            <span className="text-fg">
              {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(organizer.createdAt))}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
