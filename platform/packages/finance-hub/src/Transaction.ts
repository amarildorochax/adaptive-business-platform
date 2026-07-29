/**
 * Transaction — o agrupamento lógico de um ou mais Ledger Entry relacionados a uma mesma operação
 * financeira, processada de forma atômica — todos os Ledger Entry associados são criados, ou nenhum
 * é.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Transaction {
  /** Identificador da Transaction. */
  readonly transactionId: string;

  /** Tenant ao qual a Transaction pertence. */
  readonly tenantId: string;

  /** Ledger Entry agrupados nesta Transaction. */
  readonly ledgerEntryIds: readonly string[];

  /** Momento de criação. */
  readonly createdAt: Date;
}
