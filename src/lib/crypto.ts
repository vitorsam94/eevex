import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";
import { getEnv } from "@/lib/env";

export function encryptField(value: string): string {
  const key = Buffer.from(getEnv().ENCRYPTION_KEY, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptField(value: string): string {
  const key = Buffer.from(getEnv().ENCRYPTION_KEY, "hex");
  const [ivB64, tagB64, encryptedB64] = value.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function signPayload(payload: string): string {
  return createHmac("sha256", getEnv().APP_SECRET).update(payload).digest("hex");
}

export function secureRandomToken(): string {
  return randomBytes(32).toString("hex");
}
