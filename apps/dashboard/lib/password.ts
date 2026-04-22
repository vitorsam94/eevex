import { createHash } from 'node:crypto'

export function createPasswordHash(password: string) {
  return createHash('sha256').update(password, 'utf8').digest('hex')
}

export function verifyPassword(password: string, passwordHash: string) {
  return createPasswordHash(password) === passwordHash
}
