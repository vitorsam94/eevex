import type { CheckinSource, CheckinAction, CheckinResult, PickupLogStatus, OperatorRole, StandOperatorRole } from './enums'

export interface Operator {
  id: string
  organizerId: string
  email: string
  name: string
  role: OperatorRole
  eventPermissions: string[]
  createdAt: Date
}

export interface Kiosk {
  id: string
  eventId: string
  organizerId: string
  name: string
  deviceId: string
  allowedTicketTypeIds: string[]
  badgeTemplateId: string | null
  isActive: boolean
  lastSeenAt: Date | null
  createdAt: Date
}

export interface CheckinLog {
  id: string
  orderTicketId: string
  operatorId: string | null
  kioskId: string | null
  source: CheckinSource
  action: CheckinAction
  result: CheckinResult
  deviceInfo: Record<string, unknown> | null
  createdAt: Date
}

export interface StandOperator {
  id: string
  organizerId: string
  eventId: string
  name: string
  email: string
  allowedProductIds: string[]
  role: StandOperatorRole
  isActive: boolean
  createdAt: Date
}

export interface ProductPickupLog {
  id: string
  orderProductId: string
  standOperatorId: string
  acceptanceToken: string
  tokenExpiresAt: Date
  status: PickupLogStatus
  acceptedAt: Date | null
  participantIp: string | null
  participantUa: string | null
  createdAt: Date
}

export interface BadgeTemplate {
  id: string
  eventId: string
  ticketTypeId: string | null
  name: string
  layout: BadgeLayout
  paperSize: string
  isDefault: boolean
}

export interface BadgeLayout {
  width: number
  height: number
  elements: BadgeElement[]
}

export type BadgeElement =
  | { type: 'text'; field: string; x: number; y: number; fontSize: number; fontWeight?: string }
  | { type: 'qrcode'; x: number; y: number; size: number }
  | { type: 'image'; src: string; x: number; y: number; width: number; height: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
