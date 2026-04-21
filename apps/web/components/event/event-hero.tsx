'use client'

import Image from 'next/image'
import { Badge } from '@eevex/ui'
import { Calendar, MapPin, Users } from 'lucide-react'

interface EventHeroProps {
  event: {
    name: string
    coverImage: string | null
    type: string
    startsAt: Date
    endsAt: Date
    timezone: string
    location: unknown
    capacity: number | null
    organizer: { name: string }
  }
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  in_person: 'Presencial',
  online: 'Online',
  hybrid: 'Híbrido',
}

export function EventHero({ event }: EventHeroProps) {
  const loc = event.location as { address?: string; city?: string; state?: string; online_url?: string } | null
  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: event.timezone,
  }).format(new Date(event.startsAt))

  return (
    <div className="relative w-full">
      {event.coverImage ? (
        <div className="relative h-[340px] w-full">
          <Image
            src={event.coverImage}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </div>
      ) : (
        <div className="h-[220px] w-full bg-gradient-to-br from-primary/20 via-bg-elev to-bg-elev-2" />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="live">{EVENT_TYPE_LABEL[event.type] ?? event.type}</Badge>
          <span className="font-mono text-[10px] text-fg-dim">por {event.organizer.name}</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-fg mb-4">
          {event.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-fg-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{dateStr}</span>
          </div>
          {loc?.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {loc.address ? `${loc.address}, ` : ''}{loc.city}
                {loc.state ? `/${loc.state}` : ''}
              </span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>Capacidade: {event.capacity.toLocaleString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
