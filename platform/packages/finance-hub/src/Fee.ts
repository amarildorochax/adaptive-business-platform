/**
 * Fee — uma taxa aplicada a uma transação, cobrada pela plataforma ou repassada de um Provider
 * externo.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Fee {
  /** Identificador do Fee. */
  readonly feeId: string;

  /** Transaction à qual este Fee se aplica. */
  readonly transactionId: string;

  /** Valor da taxa. */
  readonly amount: number;
}
