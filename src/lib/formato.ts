/**
 * FORMATO — dinheiro, data e contagem de dias, em português de canteiro.
 *
 * ⚠️ Todo formatador é determinístico e com locale FIXO (`pt-BR`). Deixar o
 * locale do navegador decidir faria o servidor e o telefone renderizarem
 * strings diferentes — e a tela piscaria na frente do cliente.
 */

const MOEDA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const MOEDA_CURTA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const NUMERO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** R$ 212.400,00 */
export function dinheiro(cents: number): string {
  return MOEDA.format(cents / 100);
}

/** R$ 212.400 — para título grande, onde os centavos só atrapalham. */
export function dinheiroCurto(cents: number): string {
  return MOEDA_CURTA.format(cents / 100);
}

/** 1.240,50 */
export function numero(n: number): string {
  return NUMERO.format(n);
}

/** 21/08/2026 — a partir de uma data ISO, sem passar por fuso. */
export function data(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** 21/08 — quando o ano é óbvio pelo contexto. */
export function dataCurta(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** "18 dias" · "1 dia" · "hoje" */
export function dias(n: number): string {
  if (n <= 0) return 'hoje';
  return n === 1 ? '1 dia' : `${n} dias`;
}

/** "há 18 dias" · "hoje" */
export function haDias(n: number): string {
  if (n <= 0) return 'hoje';
  return `há ${dias(n)}`;
}

/** "em 6 dias" · "vencida há 9 dias" · "vence hoje" */
export function vencimento(diasRestantes: number): string {
  if (diasRestantes === 0) return 'vence hoje';
  if (diasRestantes < 0) return `vencida há ${dias(-diasRestantes)}`;
  return `em ${dias(diasRestantes)}`;
}

/** 62% — sempre inteiro, para a régua não vibrar. */
export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

/** A parte da fração, protegida contra divisão por zero. */
export function fracao(parte: number, todo: number): number {
  if (todo <= 0) return 0;
  return Math.max(0, Math.min(1, parte / todo));
}

/** "1 recusa" · "10 recusas" — o plural que a tela não pode errar. */
export function plural(n: number, singular: string, plural_: string): string {
  return `${n} ${n === 1 ? singular : plural_}`;
}
