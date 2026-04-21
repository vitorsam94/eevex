import { PrismaClient } from '@prisma/client'

const dbUrl = process.env.DATABASE_URL
console.log('[db] DATABASE_URL defined:', !!dbUrl, dbUrl?.slice(0, 30))

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: { db: { url: dbUrl } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma as db }

export * from '@prisma/client'
