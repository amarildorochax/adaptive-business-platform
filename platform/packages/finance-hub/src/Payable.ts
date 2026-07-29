/**
 * Payable — valor a pagar, ainda pendente de quitação pela Empresa; estrutura equivalente a
 * Receivable, mas na direção oposta do fluxo de valor.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Payable {
  /** Identificador do Payable. */
  readonly payableId: string;

  /** Tenant ao qual este Payable pertence. */
  readonly tenantId: string;

  /** Valor devido pela Empresa. */
  readonly amount: number;

  /** Momento de registro. */
  readonly registeredAt: Date;
}
