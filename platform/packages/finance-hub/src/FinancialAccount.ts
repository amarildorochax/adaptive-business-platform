/**
 * Financial Account — a conta financeira interna que agrupa Ledger Entry e Balance de uma Empresa ou
 * de um Cliente. O Finance Hub nunca lê Customer diretamente — mantém sua própria Financial Account,
 * referenciando o Relationship por identificador (Blueprint, Capítulo 5).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface FinancialAccount {
  /** Identificador da Financial Account. */
  readonly financialAccountId: string;

  /** Tenant ao qual esta conta pertence. */
  readonly tenantId: string;

  /** Referência opaca ao Relationship do CRM Hub, quando aplicável — nunca uma cópia de Customer. */
  readonly relationshipId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
