export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function isValidCpf(cpf: string): boolean {
  const normalized = normalizeCpf(cpf);
  if (normalized.length !== 11 || /^(\d)\1+$/.test(normalized)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(normalized[i]) * (10 - i);
  let first = (sum * 10) % 11;
  if (first === 10) first = 0;
  if (first !== Number(normalized[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(normalized[i]) * (11 - i);
  let second = (sum * 10) % 11;
  if (second === 10) second = 0;
  return second === Number(normalized[10]);
}

export function formatCpf(cpf: string): string {
  const normalized = normalizeCpf(cpf);
  return normalized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
