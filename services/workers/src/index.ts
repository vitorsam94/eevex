import { Worker, Queue } from 'bullmq'
import IORedis from 'ioredis'
import pino from 'pino'
import { handleTicketIssued } from './jobs/ticket-issued'
import { handleOrderExpiry } from './jobs/order-expiry'
import { handleSendEmail } from './jobs/send-email'

const log = pino({ transport: { target: 'pino-pretty' } })

const redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

// ----- Queues (exported for producers) -----
export const ticketQueue = new Queue('ticket-issued', { connection: redis })
export const emailQueue = new Queue('send-email', { connection: redis })
export const expiryQueue = new Queue('order-expiry', { connection: redis })

// ----- Workers -----
new Worker(
  'ticket-issued',
  async (job) => handleTicketIssued(job.data),
  { connection: redis, concurrency: 10 },
)

new Worker(
  'send-email',
  async (job) => handleSendEmail(job.data),
  { connection: redis, concurrency: 5 },
)

new Worker(
  'order-expiry',
  async (job) => handleOrderExpiry(job.data),
  { connection: redis, concurrency: 5 },
)

log.info('Workers started')
