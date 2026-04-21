import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@eevex/db'
import { EventHero } from '@/components/event/event-hero'
import { TicketSelector } from '@/components/event/ticket-selector'
import { EventInfo } from '@/components/event/event-info'

interface Props {
  params: { slug: string }
  searchParams: { ref?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }
}

async function getEvent(slug: string) {
  return db.event.findUnique({
    where: { slug, status: 'published' },
    include: {
      organizer: { select: { name: true, slug: true } },
      ticketTypes: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          batches: { where: { status: 'active' }, take: 1 },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.slug)
  if (!event) return { title: 'Evento não encontrado' }
  return {
    title: event.name,
    description: typeof event.description === 'string' ? event.description.slice(0, 160) : undefined,
    openGraph: {
      title: event.name,
      images: event.coverImage ? [event.coverImage] : [],
    },
  }
}

export default async function EventPage({ params, searchParams }: Props) {
  const event = await getEvent(params.slug)
  if (!event) notFound()

  return (
    <div className="min-h-screen bg-bg">
      <EventHero event={event} />
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EventInfo event={event} />
        </div>
        <div className="lg:col-span-1">
          <TicketSelector
            ticketTypes={event.ticketTypes}
            eventSlug={params.slug}
            campaignParams={searchParams}
          />
        </div>
      </div>
    </div>
  )
}
