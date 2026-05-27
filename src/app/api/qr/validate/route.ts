import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { unauthorized } from "@/lib/api";
import { signPayload } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  payload: z.string().min(1),
  signature: z.string().min(1),
  consume: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ valid: false, reason: "Formato inválido" }, { status: 400 });

  const { payload, signature, consume } = parsed.data;
  const expected = signPayload(payload);

  if (expected !== signature) return NextResponse.json({ valid: false, reason: "Assinatura inválida" });

  let decoded: { token: string; eventId: string; issuedAt: string };
  try {
    decoded = JSON.parse(payload);
  } catch {
    return NextResponse.json({ valid: false, reason: "Payload inválido" });
  }

  const ticket = await prisma.ticket.findUnique({ where: { secureToken: decoded.token }, include: { event: true } });
  if (!ticket) return NextResponse.json({ valid: false, reason: "Ingresso não encontrado" });
  if (ticket.eventId !== decoded.eventId) return NextResponse.json({ valid: false, reason: "Evento inconsistente" });
  if (ticket.status === "USED") return NextResponse.json({ valid: false, reason: "Ingresso já utilizado" });
  if (ticket.status === "VOID") return NextResponse.json({ valid: false, reason: "Ingresso cancelado" });

  if (consume) {
    await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "USED", usedAt: new Date() } });
  }

  return NextResponse.json({
    valid: true,
    reason: "OK",
    ticket: { id: ticket.id, eventName: ticket.event.name, holderName: ticket.holderName, status: consume ? "USED" : ticket.status },
  });
}
