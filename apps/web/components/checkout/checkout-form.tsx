'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Input, Separator } from '@eevex/ui'
import { CreditCard, Smartphone } from 'lucide-react'

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido')
    .transform((v) => v.replace(/\D/g, '')),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  eventId: string
  items: Array<{ ticketType: { id: string; name: string }; batch: { id: string; price: number }; qty: number }>
  ref?: string
  utmParams: Record<string, string | undefined>
}

type PaymentMethod = 'card' | 'pix'

export function CheckoutForm({ eventId, items, ref, utmParams }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'payment'>('details')
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmitDetails(values: FormValues) {
    setStep('payment')
    form.setValue('name', values.name)
    form.setValue('email', values.email)
    form.setValue('cpf', values.cpf)
  }

  async function onPayment() {
    setLoading(true)
    setError(null)
    try {
      const values = form.getValues()
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          items: items.map((i) => ({ ticketTypeId: i.ticketType.id, batchId: i.batch.id, qty: i.qty })),
          buyer: { name: values.name, email: values.email, cpf: values.cpf },
          paymentMethod: method,
          ref,
          utmParams,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao processar pagamento')
      router.push(`/pedidos/${data.orderId}/confirmacao`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: buyer details */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-mono font-medium ${
              step === 'details' ? 'bg-primary text-white' : 'bg-accent text-bg'
            }`}
          >
            {step === 'payment' ? '✓' : '1'}
          </div>
          <h2 className="font-heading font-medium text-fg">Seus dados</h2>
        </div>

        {step === 'details' ? (
          <form onSubmit={form.handleSubmit(onSubmitDetails)} className="space-y-4">
            <Input
              label="Nome completo"
              required
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
            <Input
              label="E-mail"
              type="email"
              required
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Input
              label="CPF"
              required
              placeholder="000.000.000-00"
              {...form.register('cpf')}
              error={form.formState.errors.cpf?.message}
            />
            <Input
              label="Telefone"
              type="tel"
              placeholder="(11) 90000-0000"
              {...form.register('phone')}
            />
            <Button type="submit" className="w-full">
              Continuar para pagamento
            </Button>
          </form>
        ) : (
          <div className="space-y-1 text-sm">
            <p className="text-fg">{form.getValues('name')}</p>
            <p className="text-fg-muted">{form.getValues('email')}</p>
            <button
              onClick={() => setStep('details')}
              className="text-primary text-xs hover:underline"
            >
              Editar dados
            </button>
          </div>
        )}
      </Card>

      {/* Step 2: payment */}
      {step === 'payment' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-mono font-medium text-white">
              2
            </div>
            <h2 className="font-heading font-medium text-fg">Pagamento</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('card')}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                method === 'card'
                  ? 'border-primary bg-primary/10 text-fg'
                  : 'border-border bg-bg-elev text-fg-muted hover:border-border-strong'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Cartão
            </button>
            <button
              onClick={() => setMethod('pix')}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                method === 'pix'
                  ? 'border-primary bg-primary/10 text-fg'
                  : 'border-border bg-bg-elev text-fg-muted hover:border-border-strong'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Pix
            </button>
          </div>

          {method === 'pix' && (
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
              <p className="text-xs text-accent">
                Um QR Code Pix será gerado após confirmar. Você terá 30 minutos para pagar.
                O ingresso é emitido assim que o pagamento for confirmado.
              </p>
            </div>
          )}

          {method === 'card' && (
            <div className="rounded-lg bg-bg-elev-2 border border-border p-4">
              <p className="text-xs text-fg-dim text-center">
                Integração com Stripe — campos do cartão serão exibidos aqui
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-danger/10 border border-danger/20 p-3">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          <Separator />

          <Button
            onClick={onPayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processando...' : method === 'pix' ? 'Gerar QR Code Pix' : 'Pagar com cartão'}
          </Button>

          <p className="text-center text-xs text-fg-dim">
            Compra segura · Dados criptografados · Sem taxa de cadastro
          </p>
        </Card>
      )}
    </div>
  )
}
