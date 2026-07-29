/**
 * Invoice Item — uma linha individual dentro de uma Invoice, detalhando o que está sendo cobrado e
 * seu valor específico.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface InvoiceItem {
  /** Identificador do Invoice Item. */
  readonly invoiceItemId: string;

  /** Invoice à qual este item pertence. */
  readonly invoiceId: string;

  /** Descrição do que está sendo cobrado. */
  readonly description: string;

  /** Valor desta linha. */
  readonly amount: number;
}
