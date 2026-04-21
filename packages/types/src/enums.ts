export type EventType = 'in_person' | 'online' | 'hybrid'
export type EventStatus = 'draft' | 'published' | 'paused' | 'ended' | 'archived'

export type TicketTypeKind = 'main' | 'complementary' | 'courtesy'
export type BatchStatus = 'waiting' | 'active' | 'closed'

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'

export type OrderTicketStatus = 'reserved' | 'issued' | 'checked_in' | 'cancelled' | 'refunded'
export type OrderProductStatus = 'pending_pickup' | 'picked_up' | 'not_collected'

export type PaymentGateway = 'stripe' | 'pagseguro'
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto' | 'apple_pay' | 'google_pay'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'

export type CouponType = 'percentage' | 'fixed' | 'free'

export type OperatorRole = 'admin' | 'checkin_staff' | 'kiosk'
export type StandOperatorRole = 'stand_staff' | 'stand_admin'

export type CheckinSource = 'receptionist' | 'kiosk'
export type CheckinAction = 'checkin' | 'second_attempt' | 'reprint' | 'manual_search'
export type CheckinResult = 'success' | 'already_used' | 'invalid' | 'cancelled' | 'type_restricted'

export type PickupLogStatus = 'pending' | 'accepted' | 'expired'
export type PickupMode = 'qr_required' | 'staff_confirm'

export type ParticipantAccountStatus = 'guest' | 'registered'

export type ActivityType = 'workshop' | 'talk' | 'seminar' | 'panel' | 'other'

export type WebhookStatus = 'pending' | 'processed' | 'failed'

export type OrganizerPlan = 'free' | 'starter' | 'pro' | 'enterprise'
