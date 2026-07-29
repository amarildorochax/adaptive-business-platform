/**
 * Ledger Entry — a unidade atômica e imutável de registro contábil, nunca alterada ou removida após
 * sua criação, a fonte de verdade única sobre a qual Balance é sempre recalculado (Blueprint,
 * ADR-002). O tipo `Debit`/`Credit` representa a mesma distinção já registrada em
 * `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 4 (Credit/Debit), aplicada como atributo de um único
 * conceito de registro contábil, nunca como duas Entidades separadas.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type LedgerEntryType = "Debit" | "Credit";

export interface LedgerEntry {
  /** Identificador do Ledger Entry. */
  readonly ledgerEntryId: string;

  /** Financial Account à qual este registro pertence. */
  readonly financialAccountId: string;

  /** Transaction à qual este registro pertence. */
  readonly transactionId: string;

  /** Natureza do registro — débito ou crédito. */
  readonly type: LedgerEntryType;

  /** Valor do registro. */
  readonly amount: number;

  /** Momento de criação — imutável a partir deste ponto. */
  readonly createdAt: Date;
}
