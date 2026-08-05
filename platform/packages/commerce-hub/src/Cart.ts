/**
 * Cart — retém a intenção de compra de um visitante ou Cliente antes da confirmação de Checkout, per
 * `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 16. Nunca é, ele mesmo, um compromisso comercial — apenas
 * Order, criado a partir de um Checkout confirmado, o é.
 *
 * `customerReferenceId` é sempre uma referência opaca a Lead/Customer do CRM Hub — nunca o tipo
 * `Customer`/`Lead` de `@abp/crm-hub` (ADR-002, mesmo padrão já aplicado a `Audience.memberReferenceIds`
 * em `@abp/growth-hub`).
 *
 * `status` inclui `CheckedOut` mesmo sem a Entidade `Checkout` estar implementada nesta Sprint
 * (Fase 2 do Roadmap, fora de escopo) — o valor marca a transição de saída do Cart, sem exigir o
 * fluxo de Checkout completo (ver relatório desta Sprint).
 */
export type CartStatus = 'Active' | 'Abandoned' | 'CheckedOut';

export interface Cart {
  /** Identificador do Cart. */
  readonly cartId: string;

  /** Tenant ao qual o Cart pertence. */
  readonly tenantId: string;

  /** Lead/Customer (CRM Hub) associado, quando já identificado — referência opaca. */
  readonly customerReferenceId?: string;

  /** Estado do Cart. */
  readonly status: CartStatus;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última atualização. */
  readonly updatedAt: Date;
}
