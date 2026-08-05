import type { SupplierCatalogItem } from './SupplierCatalogItem';

/**
 * SupplierCatalogItemRepository — contrato de persistência de SupplierCatalogItem. Interface
 * apenas — nenhuma implementação é definida por esta Sprint.
 */
export interface SupplierCatalogItemRepository {
  create(item: SupplierCatalogItem): Promise<SupplierCatalogItem>;
  update(item: SupplierCatalogItem): Promise<SupplierCatalogItem>;
  findById(catalogItemId: string): Promise<SupplierCatalogItem | undefined>;
  findBySupplier(supplierId: string): Promise<readonly SupplierCatalogItem[]>;
  findByProduct(productId: string): Promise<readonly SupplierCatalogItem[]>;
}
