import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { badRequest, unauthorized } from "@/lib/api";
import { encryptField, secureRandomToken, signPayload } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { issueTicketSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const parsed = issueTicketSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");

  const data = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event) return badRequest("Evento não encontrado");

  const issuedAt = new Date().toISOString();
  const secureToken = secureRandomToken();
  const qrPayload = JSON.stringify({ token: secureToken, eventId: event.id, issuedAt });
  const qrSignature = signPayload(qrPayload);

  const ticket = await prisma.ticket.create({
    data: {
      eventId: event.id,
      holderName: data.holderName,
      cpfEncrypted: encryptField(data.cpf),
      phoneEncrypted: data.phone ? encryptField(data.phone) : null,
      cv: data.cv,
      priceBRL: event.priceBRL,
      secureToken,
      qrPayload,
      qrSignature,
      status: "ISSUED",
    },
  });

  return NextResponse.json({ ticketId: ticket.id });
}
