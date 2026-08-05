/**
 * Order — o Aggregate central e definitivo do Commerce Hub, o compromisso comercial confirmado, per
 * `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 18. Ciclo de vida completo do Checkout confirmado (ou de
 * `OpportunityWon`, CRM Hub) até a entrega. Uma vez `Cancelled`, preserva histórico integralmente,
 * nunca removido fisicamente (Soft Delete, Capítulo 33).
 *
 * `customerReferenceId` é sempre uma referência opaca ao CRM Hub — nunca o tipo `Customer`/`Lead` de
 * `@abp/crm-hub` (ADR-002). `Order` nunca cria `Invoice`/`Payment` diretamente — apenas publica o
 * Evento que o Finance Hub consumiria para criá-los (ADR-CM-004); nenhum tipo de `@abp/finance-hub` é
 * importado por este arquivo.
 */
export type OrderStatus = 'Pending' | 'Paid' | 'Fulfilling' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  /** Identificador do Order. */
  readonly orderId: string;

  /** Tenant ao qual o Order pertence. */
  readonly tenantId: string;

  /** Cart de origem, quando o Order nasceu de um Checkout — ausente na venda B2B consultiva direta (`OpportunityWon`). */
  readonly cartId?: string;

  /** Lead/Customer (CRM Hub) comprador — referência opaca. */
  readonly customerReferenceId?: string;

  /** Estado do ciclo de vida. */
  readonly status: OrderStatus;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última mudança de estado. */
  readonly updatedAt: Date;
}
