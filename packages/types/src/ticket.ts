import type { TicketTypeKind, BatchStatus } from './enums'

export interface TicketType {
  id: string
  eventId: string
  activityId: string | null
  name: string
  description: string | null
  type: TicketTypeKind
  totalQty: number | null
  availableQty: number
  sortOrder: number
  benefits: string[]
  maxPerBuyer: number | null
  isVisible: boolean
  requiresTicketTypeId: string | null
  createdAt: Date
}

export interface Batch {
  id: string
  ticketTypeId: string
  name: string
  price: number
  qty: number | null
  soldQty: number
  opensAt: Date | null
  closesAt: Date | null
  sortOrder: number
  status: BatchStatus
  isActive: boolean
}

export interface PurchaseLink {
  id: string
  eventId: string
  ticketTypeId: string | null
  slug: string
  name: string
  landingPageConfig: LandingPageConfig | null
  isFocused: boolean
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  ref: string | null
  isActive: boolean
  createdAt: Date
}

export interface LandingPageConfig {
  hero?: string
  description?: string
  hideOtherTickets?: boolean
}
