/**
 * PurchaseEvent — os nove Eventos de domínio publicados pelo Purchase Hub, cada um um Fato
 * consumado, nunca uma instrução. Conjunto exato de `DOMAIN_EVENT_CATALOG.md`, seção "Purchase Hub"
 * (idêntico a `PURCHASE_HUB.md`, Capítulo 8) — nenhum Evento adicional foi criado por esta Sprint,
 * per instrução explícita de IMP-301 ("Nunca criar/remover eventos").
 *
 * Diferente de `SupplierEvent` (um único Aggregate Root, `supplierId` sempre presente), o Purchase
 * Hub publica Eventos referentes a três Aggregates distintos (`PurchaseOrder`, `PurchaseRequisition`,
 * `ReorderRule`) — mesmo formato multi-Aggregate já usado por `CRMEvent.ts`
 * (`packages/crm-hub/src/CRMEvent.ts`, `relationshipId` opcional). Aqui, cada referência de Aggregate
 * é um campo opcional próprio, populado apenas quando aplicável ao `type` do Evento.
 *
 * Cada Evento carrega apenas informação pertencente ao Purchase Hub, per instrução explícita de
 * IMP-301 — nenhum campo de outro domínio (Supplier Hub, Commerce Hub, Inventory Movement Hub) é
 * embutido no payload além de identificador opaco de referência, quando aplicável.
 */
export type PurchaseEventType =
  | 'PurchaseRequisitionCreated'
  | 'PurchaseRequisitionApproved'
  | 'PurchaseCreated'
  | 'PurchaseApproved'
  | 'PurchaseSentToSupplier'
  | 'PurchaseReceived'
  | 'PurchasePartiallyReceived'
  | 'PurchaseCancelled'
  | 'ReorderRuleTriggered';

export interface PurchaseEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: PurchaseEventType;

  /** Purchase Order ao qual este Evento se refere, quando aplicável. */
  readonly purchaseOrderId?: string;

  /** Purchase Requisition à qual este Evento se refere, quando aplicável. */
  readonly requisitionId?: string;

  /** Reorder Rule à qual este Evento se refere, quando aplicável (`ReorderRuleTriggered`). */
  readonly ruleId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
