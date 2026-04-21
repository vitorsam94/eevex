import { PrismaClient } from '@prisma/client'

const dbUrl = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma as db }

export * from '@prisma/client'
