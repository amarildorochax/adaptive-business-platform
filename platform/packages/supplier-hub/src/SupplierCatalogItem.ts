import type { Money } from './Money';

/**
 * SupplierCatalogItem — associação entre um Supplier e o item de Catalog (Commerce Hub) que ele
 * fornece, com preço de tabela e prazo de entrega prometido. `listPrice` é sempre o preço de
 * *compra* cotado pelo Fornecedor, nunca confundido com `Price` (Commerce Hub), que é o preço de
 * *venda* ao Cliente final (`SUPPLIER_HUB.md`, Capítulo 3).
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 5.
 */
export interface SupplierCatalogItem {
  /** Identificador do item de catálogo do Fornecedor. */
  readonly catalogItemId: string;

  /** Supplier ao qual este item pertence. */
  readonly supplierId: string;

  /** Tenant ao qual este item pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /**
   * Produto/Variant referenciado por identificador opaco (Commerce Hub — `@abp/commerce-hub`).
   * Nenhum tipo de `@abp/commerce-hub` é importado por este pacote — apenas o identificador.
   */
  readonly productId: string;

  /** Preço de tabela cotado pelo Fornecedor — informativo, nunca vinculado automaticamente ao
   * custo de aquisição real de um Purchase Order Item futuro. */
  readonly listPrice: Money;

  /** Prazo de entrega prometido, em dias. */
  readonly leadTimeInDays: number;

  /** Quantidade mínima de pedido aceita pelo Fornecedor. */
  readonly minimumOrderQuantity: number;

  /** Momento de registro. */
  readonly createdAt: Date;
}
