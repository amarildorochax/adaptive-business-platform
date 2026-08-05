import type { Money } from './Money';

/**
 * PurchaseOrderItem — linha de um Purchase Order, referenciando um Produto do Commerce Hub apenas
 * por identificador opaco (`productId`) — nenhum tipo de `@abp/commerce-hub` é importado por este
 * pacote, mesmo Limite do Domínio já aplicado por `SupplierCatalogItem.productId`
 * (`packages/supplier-hub/src/SupplierCatalogItem.ts`). Estrutura definida em `PURCHASE_HUB.md`,
 * Capítulo 5.
 */

/** Estado de recebimento de um item — enum fechado, `PURCHASE_HUB.md`, Capítulo 6. */
export type PurchaseOrderItemStatus = 'Pending' | 'PartiallyReceived' | 'Received' | 'Cancelled';

export interface PurchaseOrderItem {
  /** Identificador do item, único dentro do Purchase Order que o contém. */
  readonly purchaseOrderItemId: string;

  /** Purchase Order ao qual este item pertence. */
  readonly purchaseOrderId: string;

  /** Produto/Variant referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Quantidade solicitada. */
  readonly quantityOrdered: number;

  /** Quantidade já recebida, acumulada por cada `Receiving` associado — nunca excede `quantityOrdered`. */
  readonly quantityReceived: number;

  /** Custo de aquisição unitário negociado com o Fornecedor para este item. */
  readonly acquisitionCost: Money;

  /** Estado de recebimento atual. */
  readonly status: PurchaseOrderItemStatus;
}
