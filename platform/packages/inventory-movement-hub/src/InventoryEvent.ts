/**
 * InventoryEvent — os sete Eventos de domínio publicados pelo Inventory Movement Hub, cada um um
 * Fato consumado, nunca uma instrução. Conjunto exato de `DOMAIN_EVENT_CATALOG.md`, seção "Inventory
 * Movement Hub" (idêntico a `INVENTORY_MOVEMENT_HUB.md`, Capítulo 8) — nenhum Evento adicional foi
 * criado por esta Sprint, per instrução explícita de IMP-401 ("Nunca inventar eventos").
 *
 * Diferente de `SupplierEvent` (um único Aggregate Root), o Inventory Movement Hub publica Eventos
 * referentes a quatro Aggregates distintos (`StockMovement`, `StockPosition` via recálculo,
 * `StockReservation`, `StockAlertRule`) — mesmo formato multi-Aggregate já usado por `PurchaseEvent`
 * (`packages/purchase-hub/src/PurchaseEvent.ts`): cada referência de Aggregate é um campo opcional
 * próprio, populado apenas quando aplicável ao `type` do Evento.
 *
 * Cada Evento carrega apenas informação pertencente ao Inventory Movement Hub, per instrução
 * explícita de IMP-401 — nenhum campo de outro domínio (Purchase Hub, Production Hub, Commerce Hub)
 * é embutido no payload além de identificador opaco de referência, quando aplicável.
 */
export type InventoryEventType =
  | 'InventoryReceived'
  | 'InventoryReserved'
  | 'InventoryReleased'
  | 'InventoryAdjusted'
  | 'InventoryConsumed'
  | 'InventoryProduced'
  | 'StockAlertTriggered';

export interface InventoryEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: InventoryEventType;

  /** Produto ao qual este Evento se refere, quando aplicável (Commerce Hub, identificador opaco). */
  readonly productId?: string;

  /** Localização física à qual este Evento se refere, quando aplicável. */
  readonly locationId?: string;

  /** Stock Movement ao qual este Evento se refere, quando aplicável. */
  readonly movementId?: string;

  /** Stock Reservation à qual este Evento se refere, quando aplicável. */
  readonly reservationId?: string;

  /** Stock Alert Rule à qual este Evento se refere, quando aplicável (`StockAlertTriggered`). */
  readonly ruleId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
