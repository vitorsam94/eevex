import { describe, expect, it } from "vitest";
import { isValidCpf } from "../cpf";
import { secureRandomToken, signPayload } from "../crypto";

process.env.APP_SECRET = "12345678901234567890123456789012";
process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/eevex";

describe("seguranca", () => {
  it("gera tokens aleatorios unicos", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 200; i += 1) tokens.add(secureRandomToken());
    expect(tokens.size).toBe(200);
  });

  it("assinatura muda se payload for alterado", () => {
    const p1 = '{"a":1}';
    const p2 = '{"a":2}';
    expect(signPayload(p1)).not.toBe(signPayload(p2));
  });

  it("valida cpf corretamente", () => {
    expect(isValidCpf("111.444.777-35")).toBe(true);
    expect(isValidCpf("111.444.777-36")).toBe(false);
  });
});
