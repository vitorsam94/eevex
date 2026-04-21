import type { EventType, EventStatus, ActivityType } from './enums'

export interface EventLocation {
  address: string
  city: string
  state: string
  lat?: number
  lng?: number
  onlineUrl?: string
}

export interface EventBranding {
  primaryColor?: string
  logo?: string
  font?: string
}

export interface CustomField {
  name: string
  label: string
  type: 'text' | 'select' | 'checkbox'
  required: boolean
  options?: string[]
}

export interface Event {
  id: string
  organizerId: string
  name: string
  slug: string
  description: string | null
  type: EventType
  status: EventStatus
  location: EventLocation | null
  startsAt: Date
  endsAt: Date
  timezone: string
  coverImage: string | null
  branding: EventBranding | null
  capacity: number | null
  customFields: CustomField[]
  createdAt: Date
}

export interface Activity {
  id: string
  eventId: string
  name: string
  description: string | null
  startsAt: Date
  endsAt: Date
  location: string | null
  capacity: number | null
  type: ActivityType
}
