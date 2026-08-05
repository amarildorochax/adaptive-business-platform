import {
  SupplierFactory,
  type CreateSupplierCatalogItemInput,
} from './SupplierFactory';
import type { SupplierCatalogItem } from './SupplierCatalogItem';
import { SupplierCatalogItemNotFoundError } from './SupplierDomainError';
import type { SupplierCatalogItemRepository } from './SupplierCatalogItemRepository';
import { SupplierValidator } from './SupplierValidator';
import type { SupplierRepository } from './SupplierRepository';

/**
 * SupplierCatalogService — encapsula a associação Fornecedor↔Produto (`SUPPLIER_HUB.md`, Capítulo
 * 10). `productId` referencia o Catalog do Commerce Hub apenas por identificador opaco — nenhum
 * tipo de `@abp/commerce-hub` é importado por este pacote; a validação de que o Produto realmente
 * existe é responsabilidade do chamador (futuro `PurchaseManager`/orquestração cross-hub), nunca
 * deste Service, per Limite do Domínio já registrado em `SUPPLIER_HUB.md`, Capítulo 3.
 */
export class SupplierCatalogService {
  private readonly factory = new SupplierFactory();
  private readonly validator: SupplierValidator;

  constructor(
    private readonly repository: SupplierCatalogItemRepository,
    supplierRepository: SupplierRepository,
  ) {
    this.validator = new SupplierValidator(supplierRepository);
  }

  async register(input: CreateSupplierCatalogItemInput): Promise<SupplierCatalogItem> {
    this.validator.ensureValidMoney(input.listPrice);

    const item = this.factory.createSupplierCatalogItem(input);
    return this.repository.create(item);
  }

  async update(
    catalogItemId: string,
    input: Partial<Pick<SupplierCatalogItem, 'listPrice' | 'leadTimeInDays' | 'minimumOrderQuantity'>>,
  ): Promise<SupplierCatalogItem> {
    const existing = await this.repository.findById(catalogItemId);

    if (!existing) {
      throw new SupplierCatalogItemNotFoundError(catalogItemId);
    }

    if (input.listPrice) {
      this.validator.ensureValidMoney(input.listPrice);
    }

    return this.repository.update({ ...existing, ...input });
  }

  async listBySupplier(supplierId: string): Promise<readonly SupplierCatalogItem[]> {
    return this.repository.findBySupplier(supplierId);
  }

  async listByProduct(productId: string): Promise<readonly SupplierCatalogItem[]> {
    return this.repository.findByProduct(productId);
  }
}
