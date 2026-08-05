/**
 * PurchaseCommand — os doze Commands do Purchase Hub, cada um idempotente através de um
 * identificador de operação único, mesma disciplina já aplicada por `SupplierCommand`.
 * Estrutura definida em `PURCHASE_HUB.md`, Capítulo 7.
 *
 * NOTA (divergência documentada, per instrução explícita de IMP-301 — "Documentar. Nunca preencher
 * silenciosamente com um Evento novo"): quatro dos doze Commands não possuem Evento correspondente
 * em `DOMAIN_EVENT_CATALOG.md` — `AddPurchaseOrderItem`, `RejectPurchaseRequisition`,
 * `CreateReorderRule`, `DeactivateReorderRule`. Cada um deles é tratado por `PurchaseManager`
 * retornando `events: []`, nunca um Evento inventado — mesmo padrão de `AddSupplierContact`/
 * `UpdateSupplierCatalogItem` em `packages/supplier-hub/src/SupplierCommand.ts`. Detalhado em
 * `IMP_301_PURCHASE_HUB_CORE_REPORT.md`, Seção "Divergências Encontradas".
 */
export type PurchaseCommandType =
  | 'CreatePurchaseOrder'
  | 'AddPurchaseOrderItem'
  | 'ApprovePurchaseOrder'
  | 'SendPurchaseOrderToSupplier'
  | 'RegisterReceiving'
  | 'CancelPurchaseOrder'
  | 'CreatePurchaseRequisition'
  | 'ApprovePurchaseRequisition'
  | 'RejectPurchaseRequisition'
  | 'ConvertRequisitionToPurchaseOrder'
  | 'CreateReorderRule'
  | 'DeactivateReorderRule';

export interface PurchaseCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: PurchaseCommandType;

  /** Momento em que o Comando foi recebido pelo PurchaseManager. */
  readonly requestedAt: Date;
}
