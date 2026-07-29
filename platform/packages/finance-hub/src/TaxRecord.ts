/**
 * Tax Record — o registro conceitual de tributo aplicável a uma transação, mantido em nível de
 * domínio sem assumir jurisdição fiscal específica — a implementação técnica de conformidade
 * tributária de uma jurisdição específica é uma decisão de camada de implementação, fora do escopo
 * deste Blueprint.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface TaxRecord {
  /** Identificador do Tax Record. */
  readonly taxRecordId: string;

  /** Transaction à qual este registro de tributo se refere. */
  readonly transactionId: string;

  /** Valor do tributo. */
  readonly amount: number;
}
