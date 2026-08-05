/**
 * InventoryCommand — os sete Commands do Inventory Movement Hub, cada um idempotente através de um
 * identificador de operação único, mesma disciplina já aplicada por `PurchaseCommand`/`SupplierCommand`.
 * Conjunto exato de `INVENTORY_MOVEMENT_HUB.md`, Capítulo 7 — nenhum Command adicional foi criado por
 * esta Sprint.
 *
 * `RegisterStockMovement` é, per Capítulo 7, "interno, acionado exclusivamente ao consumir Evento de
 * outro Hub — nunca exposto a um usuário final diretamente". Nenhuma inscrição real em Evento de
 * Purchase Hub/Production Hub/Commerce Hub existe nesta Fase (nenhum desses Hubs publica em um Event
 * Bus real ainda — mesma limitação já documentada por `packages/purchase-hub/src/ReorderRule.ts`
 * diante do próprio Inventory Movement Hub antes de esta Sprint existir). `InventoryMovementManager`
 * expõe `registerStockMovement` como qualquer outro Command — é a fachada única mesmo para Commands de
 * gatilho interno — mas quem o invoca, nesta Fase, é sempre um teste ou uma futura Sprint de
 * integração explícita, nunca uma tela de usuário final.
 *
 * NOTA (divergência documentada, per instrução explícita de IMP-401 — "Nunca inventar eventos"):
 * `CreateStockLocation`, `CreateStockAlertRule` e `DeactivateStockAlertRule` não possuem Evento
 * correspondente em `DOMAIN_EVENT_CATALOG.md` (que cataloga apenas sete Eventos para este Hub, nenhum
 * deles referente a `StockLocation`/criação ou desativação de `StockAlertRule`). Cada um deles é
 * tratado por `InventoryMovementManager` retornando `events: []`, nunca um Evento inventado — mesmo
 * padrão de `AddPurchaseOrderItem`/`RejectPurchaseRequisition`/`CreateReorderRule`/
 * `DeactivateReorderRule` em `packages/purchase-hub/src/PurchaseCommand.ts`. Detalhado em
 * `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`, Seção "Divergências Encontradas".
 */
export type InventoryCommandType =
  | 'RegisterStockMovement'
  | 'CreateStockReservation'
  | 'ReleaseStockReservation'
  | 'ConvertReservationToMovement'
  | 'CreateStockLocation'
  | 'CreateStockAlertRule'
  | 'DeactivateStockAlertRule';

export interface InventoryCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: InventoryCommandType;

  /** Momento em que o Comando foi recebido pelo InventoryMovementManager. */
  readonly requestedAt: Date;
}
