import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, "Use 64 hex chars (32 bytes)"),
  DEFAULT_ADMIN_USER: z.string().min(3).default("admin"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(6).default("admin123"),
});

let parsedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (parsedEnv) return parsedEnv;
  parsedEnv = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    APP_SECRET: process.env.APP_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    DEFAULT_ADMIN_USER: process.env.DEFAULT_ADMIN_USER,
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
  });
  return parsedEnv;
}
