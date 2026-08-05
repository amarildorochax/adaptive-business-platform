import type { InventoryEventType } from './InventoryEvent';
import type { MovementOrigin } from './MovementOrigin';
import type { StockAlertRule } from './StockAlertRule';
import type { StockReservationStatus } from './StockReservation';

/**
 * InventoryPolicy — decisões puras de negócio do Inventory Movement Hub, nunca lançam exceção (isso é
 * responsabilidade de `InventoryValidator`, que consulta esta Policy antes de decidir se lança um
 * `InventoryDomainError`). Cada função aqui é determinística e livre de efeito colateral, mesma
 * disciplina de `PurchasePolicy`/`SupplierPolicy`.
 */

/**
 * Mapeia a origem de um `StockMovement` para o Evento específico de origem já catalogado em
 * `DOMAIN_EVENT_CATALOG.md` — `undefined` quando a origem não possui Evento próprio (`SaleReturn`,
 * `ManualAdjustment`, `SaleFulfillment`), caso em que apenas `InventoryAdjusted` é publicado após o
 * recálculo de `StockPosition` (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 10: "StockPositionProjectionService
 * ... é o único ponto que publica InventoryAdjusted").
 */
export function resolveMovementOriginEvent(origin: MovementOrigin): InventoryEventType | undefined {
  switch (origin) {
    case 'Purchase':
      return 'InventoryReceived';
    case 'ProductionConsumption':
      return 'InventoryConsumed';
    case 'ProductionOutput':
      return 'InventoryProduced';
    case 'SaleFulfillment':
    case 'SaleReturn':
    case 'ManualAdjustment':
      return undefined;
  }
}

/**
 * Máquina de estados de `StockReservationStatus` (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 4/5): "expira
 * ou se converte em Stock Movement de saída, nunca as duas coisas" — `Active` é o único estado de
 * origem para qualquer transição; `Released`/`ConvertedToMovement` são ambos terminais.
 */
export function canTransitionReservationStatus(
  from: StockReservationStatus,
  to: StockReservationStatus,
): boolean {
  if (from !== 'Active') {
    return false;
  }

  return to === 'Released' || to === 'ConvertedToMovement';
}

/** `quantityAvailable` nunca é um campo próprio editável — sempre `quantityOnHand - quantityReserved`. */
export function computeQuantityAvailable(quantityOnHand: number, quantityReserved: number): number {
  return quantityOnHand - quantityReserved;
}

/**
 * Decisão pura consumida por `StockAlertEvaluationService` — uma Regra dispara quando está ativa e a
 * quantidade em mãos corrente já está no ou abaixo do `thresholdQuantity` (`INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 10/11), mesmo formato de `shouldTriggerReorder` em `packages/purchase-hub/src/PurchasePolicy.ts`.
 */
export function shouldTriggerStockAlert(
  rule: Pick<StockAlertRule, 'active' | 'thresholdQuantity'>,
  quantityOnHand: number,
): boolean {
  return rule.active && quantityOnHand <= rule.thresholdQuantity;
}
