/**
 * Receivable — valor a receber, ainda pendente de pagamento, associado a uma Invoice não paga.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Receivable {
  /** Identificador do Receivable. */
  readonly receivableId: string;

  /** Invoice à qual este Receivable se refere. */
  readonly invoiceId: string;

  /** Valor pendente. */
  readonly amount: number;

  /** Momento de identificação. */
  readonly identifiedAt: Date;
}
