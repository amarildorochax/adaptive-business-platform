import type { Supplier } from '../Supplier';
import type { SupplierRepository } from '../SupplierRepository';
import type { SupplierCatalogItem } from '../SupplierCatalogItem';
import type { SupplierCatalogItemRepository } from '../SupplierCatalogItemRepository';
import type { SupplierContract } from '../SupplierContract';
import type { SupplierContractRepository } from '../SupplierContractRepository';
import type { SupplierPerformanceRecord } from '../SupplierPerformanceRecord';
import type { SupplierPerformanceRepository } from '../SupplierPerformanceRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-201, mesmo padrão de
 * `packages/crm-hub/src/testing/InMemoryFakes.ts`). Nunca exportados pelo barrel do pacote
 * (`index.ts`) — apenas pelo subpath `@abp/supplier-hub/testing`, per `package.json`, `exports`.
 * O pacote de produção expõe apenas o contrato de Repository, nunca uma implementação de
 * persistência real — essa é escopo de IMP-202.
 */

export class FakeSupplierRepository implements SupplierRepository {
  private readonly rows = new Map<string, Supplier>();

  async create(supplier: Supplier) {
    this.rows.set(supplier.supplierId, supplier);
    return supplier;
  }

  async update(supplier: Supplier) {
    this.rows.set(supplier.supplierId, supplier);
    return supplier;
  }

  async findById(supplierId: string) {
    return this.rows.get(supplierId);
  }

  async findByTaxId(tenantId: string, taxIdValue: string) {
    return [...this.rows.values()].find(
      (s) => s.tenantId === tenantId && s.taxId.value === taxIdValue,
    );
  }

  async findActive(tenantId: string) {
    return [...this.rows.values()].filter((s) => s.tenantId === tenantId && s.status === 'Active');
  }
}

export class FakeSupplierCatalogItemRepository implements SupplierCatalogItemRepository {
  private readonly rows = new Map<string, SupplierCatalogItem>();

  async create(item: SupplierCatalogItem) {
    this.rows.set(item.catalogItemId, item);
    return item;
  }

  async update(item: SupplierCatalogItem) {
    this.rows.set(item.catalogItemId, item);
    return item;
  }

  async findById(catalogItemId: string) {
    return this.rows.get(catalogItemId);
  }

  async findBySupplier(supplierId: string) {
    return [...this.rows.values()].filter((i) => i.supplierId === supplierId);
  }

  async findByProduct(productId: string) {
    return [...this.rows.values()].filter((i) => i.productId === productId);
  }
}

export class FakeSupplierContractRepository implements SupplierContractRepository {
  private readonly rows = new Map<string, SupplierContract>();

  async create(contract: SupplierContract) {
    this.rows.set(contract.contractId, contract);
    return contract;
  }

  async findById(contractId: string) {
    return this.rows.get(contractId);
  }

  async findBySupplier(supplierId: string) {
    return [...this.rows.values()].filter((c) => c.supplierId === supplierId);
  }
}

export class FakeSupplierPerformanceRepository implements SupplierPerformanceRepository {
  private readonly rows: SupplierPerformanceRecord[] = [];

  async append(record: SupplierPerformanceRecord) {
    this.rows.push(record);
    return record;
  }

  async findBySupplier(supplierId: string) {
    return this.rows.filter((r) => r.supplierId === supplierId);
  }
}
