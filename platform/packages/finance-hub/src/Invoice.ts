/**
 * Invoice — a cobrança formal emitida a um Cliente, agrupando um ou mais Invoice Item, com valor
 * total, prazo de vencimento e Status próprio; o ponto de partida da maioria dos fluxos financeiros.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type InvoiceStatus = "Open" | "Paid" | "Cancelled" | "Overdue";

export interface Invoice {
  /** Identificador da Invoice. */
  readonly invoiceId: string;

  /** Tenant ao qual a Invoice pertence. */
  readonly tenantId: string;

  /** Financial Account à qual esta Invoice se refere. */
  readonly financialAccountId: string;

  /** Estado atual da cobrança. */
  readonly status: InvoiceStatus;

  /** Valor total, já considerando Discount e Fee aplicáveis. */
  readonly totalAmount: number;

  /** Prazo de vencimento. */
  readonly dueAt: Date;

  /** Momento de emissão. */
  readonly createdAt: Date;
}
