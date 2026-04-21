import sgMail from '@sendgrid/mail'
import pino from 'pino'

const log = pino()
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

interface SendEmailPayload {
  to: string
  template: string
  data: Record<string, unknown>
}

const TEMPLATE_IDS: Record<string, string> = {
  'ticket-confirmation': process.env.SENDGRID_TEMPLATE_TICKET_CONFIRMATION ?? '',
  'order-pending': process.env.SENDGRID_TEMPLATE_ORDER_PENDING ?? '',
  'pickup-receipt': process.env.SENDGRID_TEMPLATE_PICKUP_RECEIPT ?? '',
}

export async function handleSendEmail({ to, template, data }: SendEmailPayload) {
  const templateId = TEMPLATE_IDS[template]
  if (!templateId) {
    log.warn({ template }, 'No SendGrid template ID configured')
    return
  }

  await sgMail.send({
    to,
    from: { email: process.env.SENDGRID_FROM_EMAIL!, name: 'Eevex' },
    templateId,
    dynamicTemplateData: data,
  })

  log.info({ to, template }, 'Email sent')
}
