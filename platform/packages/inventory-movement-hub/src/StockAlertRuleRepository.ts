import type { StockAlertRule } from './StockAlertRule';

/**
 * StockAlertRuleRepository — contrato de persistência de Stock Alert Rule, especificado literalmente
 * por `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9, estendido com `update` (necessário para
 * `DeactivateStockAlertRule`, Capítulo 7) e `findById` (necessário para localizar a Regra antes de
 * desativá-la) — mesma extensão de implementação já justificada em `StockReservationRepository.ts`.
 */
export interface StockAlertRuleRepository {
  create(rule: StockAlertRule): Promise<StockAlertRule>;
  update(rule: StockAlertRule): Promise<StockAlertRule>;
  findById(ruleId: string): Promise<StockAlertRule | undefined>;
  findActiveByProduct(productId: string, locationId?: string): Promise<StockAlertRule | undefined>;
}
