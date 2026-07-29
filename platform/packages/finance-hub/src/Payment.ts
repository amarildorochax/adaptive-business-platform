/**
 * Payment — o registro de um pagamento associado a uma Invoice, mantido separado de cada Payment
 * Attempt individual. O estado "Intent" representa o registro de intenção de pagamento, criado antes
 * de qualquer confirmação — o estado inicial de todo fluxo de Payment (Blueprint, Capítulo 7),
 * modelado aqui como o valor inicial de `status`, nunca como uma Entidade separada, para evitar
 * rastrear o mesmo fluxo em dois registros paralelos.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type PaymentStatus = "Intent" | "Authorized" | "Captured" | "Failed";

export interface Payment {
  /** Identificador do Payment. */
  readonly paymentId: string;

  /** Tenant ao qual o Payment pertence. */
  readonly tenantId: string;

  /** Invoice à qual este Payment está associado — nenhum Payment existe isolado. */
  readonly invoiceId: string;

  /** Estado atual do Payment. */
  readonly status: PaymentStatus;

  /** Valor do pagamento. */
  readonly amount: number;

  /** Momento de criação. */
  readonly createdAt: Date;
}
