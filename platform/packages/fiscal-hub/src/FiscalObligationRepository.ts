import type { FiscalObligation } from './FiscalObligation';

/**
 * FiscalObligationRepository — contrato de persistência de FiscalObligation, especificado por
 * `FISCAL_HUB.md`, Capítulo 9. `findPending`/`findOverdue`/`save` são exatamente as três assinaturas
 * do pseudocódigo original.
 *
 * DIVERGÊNCIA DOCUMENTADA (mesma disciplina de `TaxRuleRepository.findById`): `findById` foi
 * adicionado, sem estar especificado pelo Capítulo 9 — extensão de implementação necessária para que
 * o Command `MarkFiscalObligationFulfilled` (Capítulo 7) tenha como carregar a obrigação existente
 * antes de marcá-la cumprida.
 */
export interface FiscalObligationRepository {
  findPending(): Promise<readonly FiscalObligation[]>;
  findOverdue(): Promise<readonly FiscalObligation[]>;
  findById(fiscalObligationId: string): Promise<FiscalObligation | undefined>;
  save(obligation: FiscalObligation): Promise<FiscalObligation>;
}
