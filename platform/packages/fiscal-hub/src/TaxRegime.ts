/**
 * TaxRegime — enquadramento tributário de uma Empresa (`FISCAL_HUB.md`, Capítulo 5), "associado a
 * exatamente uma Empresa por Tenant" — por isso `TaxRegimeRepository.findByTenant` (Capítulo 9) é a
 * única consulta especificada, nunca por identificador arbitrário. Aggregate independente com
 * Repository próprio (`TaxRegimeRepository.ts`), mesma disciplina de "Entity (com Repository)" já
 * aplicada a `WorkCenter`/`StockLocation` — a arquitetura não o lista explicitamente entre os três
 * Aggregates do Capítulo 4, mas seu ciclo de vida e consulta próprios (Capítulo 9) o tornam um
 * Aggregate independente na prática, mesma leitura já aplicada a `WorkCenter` por IMP-501.
 */
export interface TaxRegime {
  /** Identificador do Tax Regime. */
  readonly taxRegimeId: string;

  /** Tenant ao qual o Tax Regime pertence — isolamento absoluto entre Empresas; único por Tenant. */
  readonly tenantId: string;

  /** Nome — referência conceitual ao enquadramento tributário da Empresa. */
  readonly name: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
