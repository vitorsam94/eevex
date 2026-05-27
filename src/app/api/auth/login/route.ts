import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  await ensureDefaultAdmin();

  const user = await prisma.operatorUser.findUnique({ where: { username: parsed.data.username } });
  if (!user) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const ok = await compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const token = await createSessionToken(user.username);
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
