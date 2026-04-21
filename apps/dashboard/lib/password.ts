import { compare, hash } from 'bcryptjs'

const BCRYPT_ROUNDS = 10

export function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export function createPasswordHash(password: string) {
  return hash(password, BCRYPT_ROUNDS)
}
