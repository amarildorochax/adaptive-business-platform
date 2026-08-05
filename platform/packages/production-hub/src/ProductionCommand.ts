/**
 * ProductionCommand — os nove Commands do Production Hub, cada um idempotente através de um
 * identificador de operação único, mesma disciplina já aplicada por
 * `InventoryCommand`/`PurchaseCommand`/`SupplierCommand`. Conjunto exato de `PRODUCTION_HUB.md`,
 * Capítulo 7 — nenhum Command adicional foi criado por esta Sprint.
 *
 * NOTA (divergência documentada, per instrução explícita desta Sprint — "Nunca inventar eventos"):
 * `CreateProductionOrder` e `CreateWorkCenter` não possuem Evento correspondente em
 * `DOMAIN_EVENT_CATALOG.md` (que cataloga apenas sete Eventos para este Hub, nenhum deles referente à
 * criação de uma `ProductionOrder` ou de um `WorkCenter`). Cada um deles é tratado por
 * `ProductionManager` retornando `events: []`, nunca um Evento inventado — mesmo padrão de
 * `CreateStockLocation`/`CreateStockAlertRule` em
 * `packages/inventory-movement-hub/src/InventoryCommand.ts`. Detalhado em
 * `IMP_501_PRODUCTION_HUB_CORE_REPORT.md`, Seção "Divergências Encontradas".
 */
export type ProductionCommandType =
  | 'CreateBillOfMaterials'
  | 'SupersedeBillOfMaterials'
  | 'CreateProductionOrder'
  | 'StartProduction'
  | 'RegisterProductionConsumption'
  | 'RegisterProductionOutput'
  | 'CompleteProduction'
  | 'CancelProduction'
  | 'CreateWorkCenter';

export interface ProductionCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: ProductionCommandType;

  /** Momento em que o Comando foi recebido pelo ProductionManager. */
  readonly requestedAt: Date;
}
