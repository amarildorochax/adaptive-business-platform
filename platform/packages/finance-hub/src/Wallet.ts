/**
 * Wallet — o saldo de valor mantido em nome de um Cliente ou da própria Empresa, disponível para uso
 * futuro, distinto de Balance por representar um saldo utilizável, não apenas informativo. Nunca
 * altera o Ledger diretamente — toda movimentação produz Transaction e Ledger Entry correspondentes
 * antes de refletir no saldo (Blueprint, Capítulo 12).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Wallet {
  /** Identificador da Wallet. */
  readonly walletId: string;

  /** Financial Account à qual esta Wallet pertence. */
  readonly financialAccountId: string;

  /** Saldo disponível — sempre consequência de Transaction/Ledger Entry já registrados. */
  readonly availableAmount: number;
}
