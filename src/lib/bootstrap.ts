import { hash } from "bcryptjs";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDefaultAdmin(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const env = getEnv();
  const existing = await prisma.operatorUser.findFirst({ where: { username: env.DEFAULT_ADMIN_USER } });
  if (existing) return;

  const passwordHash = await hash(env.DEFAULT_ADMIN_PASSWORD, 10);
  await prisma.operatorUser.create({
    data: {
      username: env.DEFAULT_ADMIN_USER,
      passwordHash,
    },
  });
}
