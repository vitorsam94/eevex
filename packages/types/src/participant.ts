import type { ParticipantAccountStatus } from './enums'

export interface Participant {
  id: string
  email: string
  name: string
  document: string | null
  phone: string | null
  accountStatus: ParticipantAccountStatus
  extraFields: Record<string, string>
  magicLinkExpiresAt: Date | null
  createdAt: Date
}
