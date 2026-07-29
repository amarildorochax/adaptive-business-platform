/**
 * Currency — a moeda em que uma transação é registrada.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Currency {
  /** Código da moeda (ex.: BRL, USD). */
  readonly code: string;
}
