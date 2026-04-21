import type { OrganizerPlan } from './enums'

export interface Organizer {
  id: string
  name: string
  slug: string
  email: string
  plan: OrganizerPlan
  stripeAccountId: string | null
  createdAt: Date
}
