import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { badRequest, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, eventDate: true, eventTime: true, openTime: true, address: true, priceBRL: true, status: true },
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const parsed = eventSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");

  const data = parsed.data;
  const eventDateIso = new Date(`${data.eventDate}T00:00:00`);

  const event = await prisma.event.create({
    data: {
      name: data.name,
      eventDate: eventDateIso,
      eventTime: data.eventTime,
      openTime: data.openTime,
      address: data.address,
      priceBRL: data.priceBRL,
      status: data.status,
    },
  });

  return NextResponse.json({ eventId: event.id });
}
