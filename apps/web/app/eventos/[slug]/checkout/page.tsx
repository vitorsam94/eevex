import { notFound } from 'next/navigation'
import { db } from '@eevex/db'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CheckoutSummary } from '@/components/checkout/checkout-summary'

interface Props {
  params: { slug: string }
  searchParams: Record<string, string>
}

async function getCheckoutData(slug: string, searchParams: Record<string, string>) {
  const event = await db.event.findUnique({
    where: { slug, status: 'published' },
    include: {
      ticketTypes: {
        include: { batches: { where: { status: 'active' }, take: 1 } },
      },
    },
  })
  if (!event) return null

  const items = event.ticketTypes
    .map((t) => {
      const qty = parseInt(searchParams[`t_${t.id}`] ?? '0', 10)
      const batch = t.batches[0]
      if (!qty || !batch) return null
      return { ticketType: t, batch, qty }
    })
    .filter(Boolean) as Array<{
    ticketType: (typeof event.ticketTypes)[0]
    batch: NonNullable<(typeof event.ticketTypes)[0]['batches'][0]>
    qty: number
  }>

  return { event, items }
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const data = await getCheckoutData(params.slug, searchParams)
  if (!data || data.items.length === 0) notFound()

  const { event, items } = data
  const ref = searchParams.ref
  const utmParams = {
    utm_source: searchParams.utm_source,
    utm_medium: searchParams.utm_medium,
    utm_campaign: searchParams.utm_campaign,
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fg-dim mb-1">
            {event.name}
          </p>
          <h1 className="font-heading text-2xl font-semibold text-fg">Finalizar compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <CheckoutForm
              eventId={event.id}
              items={items}
              ref={ref}
              utmParams={utmParams}
            />
          </div>
          <div className="lg:col-span-2">
            <CheckoutSummary event={event} items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
