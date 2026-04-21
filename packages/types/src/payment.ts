import type { PaymentGateway, PaymentMethod, PaymentStatus, WebhookStatus } from './enums'

export interface Payment {
  id: string
  orderId: string
  gateway: PaymentGateway
  method: PaymentMethod
  gatewayPaymentId: string | null
  status: PaymentStatus
  amount: number
  paidAt: Date | null
  refundedAt: Date | null
  metadata: Record<string, unknown> | null
}

export interface WebhookEvent {
  id: string
  gateway: PaymentGateway
  externalEventId: string
  type: string
  payload: Record<string, unknown>
  processedAt: Date | null
  status: WebhookStatus
}
