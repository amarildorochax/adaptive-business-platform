import type { TaxRegime } from './TaxRegime';

/**
 * TaxRegimeRepository — contrato de persistência de TaxRegime, especificado literalmente por
 * `FISCAL_HUB.md`, Capítulo 9. A arquitetura descreve o retorno de `findByTenant` como
 * `TaxRegime | null` (pseudocódigo); todo Repository Interface já existente no monorepo usa
 * `| undefined` para "ausência", nunca `| null` — esta Sprint segue a convenção já estabelecida no
 * código real, mesma decisão de alinhamento já documentada por IMP-401
 * (`StockAlertRuleRepository.findActiveByProduct`).
 */
export interface TaxRegimeRepository {
  findByTenant(tenantId: string): Promise<TaxRegime | undefined>;
  save(regime: TaxRegime): Promise<TaxRegime>;
}
