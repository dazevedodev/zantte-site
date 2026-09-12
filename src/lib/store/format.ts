export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

// valida o dígito verificador de verdade, não só o tamanho — um CPF com
// 11 dígitos mas checksum errado passava direto pro Mercado Pago e travava
// o botão "Criar Pix" lá sem nenhuma mensagem de erro pro cliente.
export function isValidCpf(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  function checkDigit(base: string): number {
    let sum = 0;
    let weight = base.length + 1;
    for (const char of base) {
      sum += Number(char) * weight;
      weight--;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  const base = digits.slice(0, 9);
  const d1 = checkDigit(base);
  const d2 = checkDigit(base + d1);
  return digits === `${base}${d1}${d2}`;
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function discountPercent(compareAtCents: number, priceCents: number): number {
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

export function formatCep(cep: string) {
  const digits = onlyDigits(cep).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

// nunca mostra o número exato de vendas — arredonda pra baixo pro degrau
// mais próximo, no mesmo padrão que o Mercado Livre usa ("+100 vendidos").
// Continua 100% verdadeiro (quem vendeu 57 também vendeu "+50"), só não
// expõe o número cru.
const SOLD_THRESHOLDS = [1000, 500, 250, 100, 50, 25, 10, 5];

export function formatSoldCount(unitsSold: number): string | null {
  const threshold = SOLD_THRESHOLDS.find((t) => unitsSold >= t);
  return threshold ? `+${threshold} vendas` : null;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
