'use client'

import { Separator } from '@eevex/ui'
import { MapPin, Clock, Globe } from 'lucide-react'

interface EventInfoProps {
  event: {
    description: unknown
    startsAt: Date
    endsAt: Date
    timezone: string
    location: unknown
    type: string
  }
}

export function EventInfo({ event }: EventInfoProps) {
  const loc = event.location as {
    address?: string
    city?: string
    state?: string
    lat?: number
    lng?: number
    online_url?: string
  } | null

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: event.timezone,
    }).format(d)

  const description =
    typeof event.description === 'string'
      ? event.description
      : JSON.stringify(event.description)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-medium text-lg text-fg mb-3">Sobre o evento</h2>
        <p className="text-fg-muted leading-relaxed whitespace-pre-line">{description}</p>
      </div>

      <Separator />

      <div>
        <h2 className="font-heading font-medium text-lg text-fg mb-3">Data e horário</h2>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-fg-muted space-y-0.5">
            <p>Início: {fmt(new Date(event.startsAt))}</p>
            <p>Término: {fmt(new Date(event.endsAt))}</p>
            <p className="text-fg-dim text-xs">Fuso: {event.timezone}</p>
          </div>
        </div>
      </div>

      {(loc?.address || loc?.online_url) && (
        <>
          <Separator />
          <div>
            <h2 className="font-heading font-medium text-lg text-fg mb-3">Local</h2>
            {event.type === 'online' || event.type === 'hybrid' ? (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-fg-muted">Evento online</p>
              </div>
            ) : null}
            {loc?.address && (
              <div className="flex items-start gap-3 mt-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-fg-muted">
                  <p>{loc.address}</p>
                  {loc.city && (
                    <p>
                      {loc.city}
                      {loc.state ? `/${loc.state}` : ''}
                    </p>
                  )}
                  {loc.lat && loc.lng && (
                    <a
                      href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs mt-1 inline-block"
                    >
                      Ver no mapa →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
