import type { PurchaseOrderItem } from './PurchaseOrderItem';

/**
 * PurchaseOrder — Aggregate Root do Purchase Hub (`PURCHASE_HUB.md`, Capítulo 4). Agrupa
 * `PurchaseOrderItem` como parte interna, mesma disciplina de `Supplier`/`SupplierContact`
 * (`packages/supplier-hub/src/Supplier.ts`) — nenhum `PurchaseOrderItem` é referenciado por
 * identificador fora do `PurchaseOrder` que o contém.
 *
 * DECISÃO DE IMPLEMENTAÇÃO (documentada, per instrução de IMP-301 — "Nunca corrigir
 * silenciosamente"): `PURCHASE_HUB.md`, Capítulo 5, lista `PendingApproval` como estado distinto de
 * `Draft` na máquina de estados de `PurchaseStatus`, mas o Fluxo Completo do Capítulo 13 não descreve
 * explicitamente a transição que leva a ele. Esta Sprint resolve a ambiguidade da seguinte forma:
 * `Draft` é um Purchase Order ainda sem nenhum item; a primeira chamada a `AddPurchaseOrderItem`
 * transiciona `Draft → PendingApproval` (nenhum Evento é publicado nesta transição — não existe
 * Evento correspondente em `DOMAIN_EVENT_CATALOG.md`, e nenhum foi inventado). `ApprovePurchaseOrder`
 * transiciona `PendingApproval → Approved`, publicando `PurchaseApproved`. Detalhado por completo em
 * `IMP_301_PURCHASE_HUB_CORE_REPORT.md`, Seção "Decisões Arquiteturais".
 */

/** Estado do Purchase Order — enum fechado, `PURCHASE_HUB.md`, Capítulo 5. */
export type PurchaseStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'Sent'
  | 'PartiallyReceived'
  | 'Received'
  | 'Cancelled';

export interface PurchaseOrder {
  /** Identificador do Purchase Order. */
  readonly purchaseOrderId: string;

  /** Tenant ao qual o Purchase Order pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Fornecedor referenciado por identificador opaco (`@abp/supplier-hub`) — nenhum tipo daquele
   * pacote é importado por este. */
  readonly supplierId: string;

  /** Purchase Requisition de origem, quando este Purchase Order resulta de
   * `ConvertRequisitionToPurchaseOrder` — `undefined` quando criado diretamente. */
  readonly requisitionId?: string;

  /** Estado atual, ver máquina de estados documentada acima. */
  readonly status: PurchaseStatus;

  /** Itens do pedido — parte interna do Aggregate. */
  readonly items: readonly PurchaseOrderItem[];

  /** Identidade opaca de quem aprovou explicitamente este Purchase Order, quando aplicável —
   * `undefined` até `ApprovePurchaseOrder` ser chamado com sucesso. */
  readonly approvedByIdentityId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
