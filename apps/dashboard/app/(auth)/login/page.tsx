'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Input } from '@eevex/ui'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('E-mail ou senha inválidos')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold text-fg">Eevex</h1>
          <p className="text-fg-muted text-sm mt-1">Painel do organizador</p>
        </div>

        <Card className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              required
              autoComplete="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Input
              label="Senha"
              type="password"
              required
              autoComplete="current-password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
