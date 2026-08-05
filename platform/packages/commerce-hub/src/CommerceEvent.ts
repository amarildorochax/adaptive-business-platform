/**
 * Commerce Event — os Eventos de domínio do Commerce Hub, catalogados em
 * `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 29 (21 Eventos no total, cobrindo também Checkout, Quote,
 * Subscription Plan, Shipment e Return — nenhum destes cinco implementado nesta Sprint, Commerce
 * Core). Este arquivo declara o catálogo completo, per a mesma disciplina já aplicada por
 * `ContentEvent.ts` (IMP-004): declarar todos os tipos já aprovados, ainda que apenas um subconjunto
 * tenha produtor real nesta Sprint.
 *
 * **Diferente de CRM/Communication/Growth Hub, `COMMERCE_HUB_ARCHITECTURE.md` nunca cataloga
 * Commands** — mesma lacuna sistêmica já encontrada em `CONTENT_HUB_ARCHITECTURE.md` (IMP-004).
 * Nenhum arquivo `CommerceCommand.ts` existe nesta Sprint; `CommerceOperationResult<T>` nunca tem um
 * campo `command`, nem mesmo opcional — ver `CommerceManager.ts`.
 */
export type CommerceEventType =
  | 'ProductCreated'
  | 'ProductUpdated'
  | 'PriceChanged'
  | 'DiscountRuleApplied'
  | 'CartCreated'
  | 'CartAbandoned'
  | 'CheckoutStarted'
  | 'CheckoutCompleted'
  | 'OrderCreated'
  | 'OrderPaid'
  | 'OrderCancelled'
  | 'OrderFulfilled'
  | 'QuoteCreated'
  | 'QuoteAccepted'
  | 'QuoteConvertedToOrder'
  | 'SubscriptionPlanSubscribed'
  | 'StockUpdated'
  | 'ShipmentCreated'
  | 'ShipmentDelivered'
  | 'ReturnRequested'
  | 'ReturnApproved';

export interface CommerceEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: CommerceEventType;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
