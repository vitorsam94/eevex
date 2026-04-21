import type { PickupMode } from './enums'

export interface ProductAttribute {
  name: string
  values: string[]
}

export interface ProductSku {
  id: string
  productId: string
  attributes: Record<string, string>
  price: number
  stockQty: number
  reservedQty: number
  isActive: boolean
}

export interface Product {
  id: string
  eventId: string
  name: string
  description: string | null
  imageUrl: string | null
  eligibleTicketTypeIds: string[]
  attributes: ProductAttribute[]
  salesOpensAt: Date | null
  salesClosesAt: Date | null
  salesQtyLimit: number | null
  totalSoldQty: number
  pickupMode: PickupMode
  isActive: boolean
  skus?: ProductSku[]
}

export interface ProductVariationTemplate {
  id: string
  name: string
  attributes: ProductAttribute[]
  isSystem: boolean
  organizerId: string | null
}
