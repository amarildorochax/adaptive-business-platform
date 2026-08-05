import { InventoryFactory, type CreateStockAlertRuleInput } from './InventoryFactory';
import { StockAlertRuleNotFoundError } from './InventoryDomainError';
import { shouldTriggerStockAlert } from './InventoryPolicy';
import type { StockAlertRule } from './StockAlertRule';
import type { StockAlertRuleRepository } from './StockAlertRuleRepository';

export interface EvaluateStockAlertResult {
  readonly rule?: StockAlertRule;
  readonly triggered: boolean;
}

/**
 * StockAlertEvaluationService — "avalia Stock Alert Rule a cada recálculo de Stock Position,
 * publicando StockAlertTriggered quando o limiar é cruzado" (`INVENTORY_MOVEMENT_HUB.md`, Capítulo
 * 10). Um dos quatro Services explicitamente nomeados por aquele documento.
 *
 * `createRule`/`deactivateRule` também vivem aqui, não em um Service próprio — mesma decisão já
 * tomada por `ReorderEvaluationService` em `packages/purchase-hub/src/ReorderEvaluationService.ts`
 * ("Manter todo o ciclo de vida de ReorderRule neste único Service — criar, desativar, avaliar — é
 * uma única responsabilidade coerente"), aplicada aqui a `StockAlertRule` pelo mesmo motivo.
 *
 * Diferente de `ReorderEvaluationService.evaluate` (que recebe `currentQuantity` como parâmetro do
 * chamador, porque o Purchase Hub não tem acesso a nenhuma fonte real de estoque), `evaluate` aqui
 * recebe `quantityOnHand` também como parâmetro explícito — não porque falte uma fonte real (o próprio
 * `StockPositionRepository` já vive neste Hub), mas porque `InventoryMovementManager` já possui o
 * `StockPosition` recém-recalculado em mãos no momento em que invoca este método (resultado de
 * `StockPositionProjectionService.recalculate`), tornando uma segunda consulta redundante — decisão
 * de implementação documentada em `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`.
 */
export class StockAlertEvaluationService {
  private readonly factory = new InventoryFactory();

  constructor(private readonly repository: StockAlertRuleRepository) {}

  async createRule(input: CreateStockAlertRuleInput): Promise<StockAlertRule> {
    const rule = this.factory.createStockAlertRule(input);
    return this.repository.create(rule);
  }

  async deactivateRule(ruleId: string): Promise<StockAlertRule> {
    const existing = await this.repository.findById(ruleId);

    if (!existing) {
      throw new StockAlertRuleNotFoundError(ruleId);
    }

    return this.repository.update({ ...existing, active: false, updatedAt: new Date() });
  }

  async evaluate(productId: string, quantityOnHand: number, locationId?: string): Promise<EvaluateStockAlertResult> {
    const rule = await this.repository.findActiveByProduct(productId, locationId);

    if (!rule || !shouldTriggerStockAlert(rule, quantityOnHand)) {
      return { rule, triggered: false };
    }

    return { rule, triggered: true };
  }
}
