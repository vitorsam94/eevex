import type { OrderStatus, OrderTicketStatus, OrderProductStatus } from './enums'

export interface Order {
  id: string
  eventId: string
  participantId: string
  purchaseLinkId: string | null
  utmParams: Record<string, string> | null
  status: OrderStatus
  totalAmount: number
  feeAmount: number
  netAmount: number
  currency: string
  expiresAt: Date | null
  createdAt: Date
}

export interface OrderTicket {
  id: string
  orderId: string
  ticketTypeId: string
  batchId: string
  participantId: string
  status: OrderTicketStatus
  publicToken: string
  issuedAt: Date | null
  checkedInAt: Date | null
  checkedInBy: string | null
}

export interface OrderProduct {
  id: string
  orderId: string
  productSkuId: string
  qty: number
  unitPrice: number
  status: OrderProductStatus
  pickedUpAt: Date | null
  pickedUpBy: string | null
}
