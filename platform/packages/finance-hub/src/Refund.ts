/**
 * Refund — a devolução de valor já pago, sempre referenciando o Payment original e produzindo novos
 * Ledger Entry, nunca alterando os Ledger Entry já existentes do Payment original (Refund Creates New
 * Transactions, Blueprint ADR-008).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Refund {
  /** Identificador do Refund. */
  readonly refundId: string;

  /** Tenant ao qual o Refund pertence. */
  readonly tenantId: string;

  /** Payment original devolvido — nunca alterado por este Refund. */
  readonly paymentId: string;

  /** Valor devolvido. */
  readonly amount: number;

  /** Momento do processamento. */
  readonly processedAt: Date;
}
