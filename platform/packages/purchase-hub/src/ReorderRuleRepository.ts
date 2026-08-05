import type { ReorderRule } from './ReorderRule';

/**
 * ReorderRuleRepository — contrato de persistência de Reorder Rule. Interface apenas — nenhuma
 * implementação é definida por esta Sprint; persistência é escopo de IMP-302 (`PURCHASE_HUB.md`,
 * Capítulo 10).
 */
export interface ReorderRuleRepository {
  create(rule: ReorderRule): Promise<ReorderRule>;
  update(rule: ReorderRule): Promise<ReorderRule>;
  findById(ruleId: string): Promise<ReorderRule | undefined>;
  findActiveByProduct(tenantId: string, productId: string): Promise<readonly ReorderRule[]>;
  findAllActive(tenantId: string): Promise<readonly ReorderRule[]>;
}
