'use client'

import { useState } from 'react'
import { Button, Card, Input, Badge } from '@eevex/ui'
import { Search, QrCode, CheckCircle2, Package } from 'lucide-react'

interface OrderProduct {
  id: string
  product: { name: string }
  sku: { attributes: Record<string, string> }
  qty: number
  status: string
}

interface ParticipantResult {
  id: string
  name: string
  email: string
  items: OrderProduct[]
}

interface AcceptanceQR {
  orderProductId: string
  qrDataUrl: string
  token: string
}

export function StandApp() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [participant, setParticipant] = useState<ParticipantResult | null>(null)
  const [activeQR, setActiveQR] = useState<AcceptanceQR | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function searchParticipant() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stand/participant?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Participante não encontrado')
      const data = await res.json()
      setParticipant(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro na busca')
      setParticipant(null)
    } finally {
      setLoading(false)
    }
  }

  async function startDelivery(orderProductId: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/stand/generate-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderProductId }),
      })
      const data = await res.json()
      setActiveQR(data)
    } catch {
      setError('Erro ao gerar QR de aceite')
    } finally {
      setLoading(false)
    }
  }

  function getSkuLabel(attributes: Record<string, string>) {
    const entries = Object.entries(attributes)
    if (entries.length === 0) return ''
    return entries.map(([k, v]) => `${k}: ${v}`).join(' · ')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-fg-dim mb-1">Eevex</p>
          <h1 className="font-heading text-xl font-semibold text-fg">Stand · Entrega de Itens</h1>
        </div>

        {/* Search */}
        <Card className="p-4 space-y-3">
          <p className="text-sm text-fg-muted">Buscar participante por nome, CPF ou código do pedido</p>
          <div className="flex gap-2">
            <Input
              placeholder="Nome, CPF ou código..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchParticipant()}
            />
            <Button onClick={searchParticipant} disabled={loading} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </Card>

        {/* Participant results */}
        {participant && (
          <div className="space-y-4">
            <Card className="p-4">
              <p className="font-heading font-medium text-fg">{participant.name}</p>
              <p className="text-sm text-fg-muted">{participant.email}</p>
            </Card>

            <div className="space-y-3">
              {participant.items.length === 0 ? (
                <p className="text-center text-fg-muted text-sm py-4">
                  Nenhum item pendente de retirada.
                </p>
              ) : (
                participant.items.map((item) => (
                  <Card key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="h-4 w-4 text-fg-dim shrink-0" />
                        <div className="min-w-0">
                          <p className="font-heading font-medium text-sm text-fg">
                            {item.product.name}
                          </p>
                          {Object.keys(item.sku.attributes).length > 0 && (
                            <p className="text-xs text-fg-muted">{getSkuLabel(item.sku.attributes)}</p>
                          )}
                          <p className="text-xs text-fg-dim">Qtd: {item.qty}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.status === 'picked_up'
                            ? 'success'
                            : item.status === 'pending_pickup'
                            ? 'warn'
                            : 'default'
                        }
                      >
                        {item.status === 'picked_up' ? 'Retirado' : item.status === 'pending_pickup' ? 'Pendente' : item.status}
                      </Badge>
                    </div>

                    {item.status === 'pending_pickup' && (
                      <Button
                        onClick={() => startDelivery(item.id)}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                      >
                        <QrCode className="h-4 w-4" />
                        Iniciar entrega
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Acceptance QR modal */}
        {activeQR && (
          <div className="fixed inset-0 bg-bg/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-xs p-6 space-y-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-fg-dim">
                Aceite digital
              </p>
              <h2 className="font-heading font-medium text-fg">
                Peça ao participante escanear
              </h2>

              {activeQR.qrDataUrl && (
                <img
                  src={activeQR.qrDataUrl}
                  alt="QR de aceite"
                  className="mx-auto rounded-lg"
                  width={200}
                  height={200}
                />
              )}

              <div className="rounded-lg bg-bg-elev-2 border border-border p-3">
                <p className="font-mono text-lg font-bold tracking-widest text-fg">
                  {activeQR.token.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-fg-dim mt-1">Código de fallback</p>
              </div>

              <p className="text-xs text-warn">⏱ Válido por 5 minutos</p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveQR(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveQR(null)
                    setParticipant(null)
                    setQuery('')
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
