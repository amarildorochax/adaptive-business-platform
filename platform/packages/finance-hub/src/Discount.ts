/**
 * Discount — uma redução aplicada a uma Invoice antes de seu valor final ser calculado.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Discount {
  /** Identificador do Discount. */
  readonly discountId: string;

  /** Invoice à qual este Discount se aplica. */
  readonly invoiceId: string;

  /** Valor da redução. */
  readonly amount: number;
}
