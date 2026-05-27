import { z } from "zod";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";

export const eventSchema = z.object({
  name: z.string().min(3),
  eventDate: z.string().min(10),
  eventTime: z.string().min(4),
  openTime: z.string().min(4),
  address: z.string().min(8),
  priceBRL: z.coerce.number().int().positive(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("PUBLISHED"),
});

export const issueTicketSchema = z.object({
  eventId: z.string().min(1),
  holderName: z.string().min(3),
  cpf: z
    .string()
    .transform(normalizeCpf)
    .refine((cpf) => isValidCpf(cpf), "CPF inválido"),
  phone: z.string().optional().default(""),
  cv: z.string().min(1),
});
