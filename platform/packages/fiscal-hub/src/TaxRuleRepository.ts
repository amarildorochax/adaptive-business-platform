import type { TaxClassification } from './TaxClassification';
import type { TaxRule } from './TaxRule';

/**
 * TaxRuleRepository — contrato de persistência de TaxRule, especificado por `FISCAL_HUB.md`, Capítulo
 * 9. `findApplicable`/`save` são exatamente as duas assinaturas do pseudocódigo original.
 *
 * DIVERGÊNCIA DOCUMENTADA (per instrução desta Sprint — "Nunca corrigir silenciosamente"):
 * `findById` foi adicionado, sem estar especificado pelo Capítulo 9 — extensão de implementação
 * necessária para que o Command `DeactivateTaxRule` (Capítulo 7) tenha como carregar a regra existente
 * antes de desativá-la; sem esta consulta, não há como localizar uma `TaxRule` por identificador para
 * atualizá-la. Mesma disciplina de extensão já aplicada por `StockLocationRepository`
 * (Inventory Movement Hub, IMP-401, Divergência 4 — "extensão de implementação necessária para o
 * Command CreateStockLocation ter onde persistir").
 */
export interface TaxRuleRepository {
  findApplicable(taxRegimeId: string, classification: TaxClassification, date: Date): Promise<TaxRule | undefined>;
  findById(taxRuleId: string): Promise<TaxRule | undefined>;
  save(rule: TaxRule): Promise<TaxRule>;
}
