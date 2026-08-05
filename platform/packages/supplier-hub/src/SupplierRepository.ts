import type { Supplier } from './Supplier';

/**
 * SupplierRepository — contrato de persistência de Supplier. Interface apenas — nenhuma
 * implementação (SQLite, in-memory de produção) é definida por esta Sprint; persistência é
 * escopo de IMP-202 (`SUPPLIER_HUB.md`, Capítulo 10).
 */
export interface SupplierRepository {
  create(supplier: Supplier): Promise<Supplier>;
  update(supplier: Supplier): Promise<Supplier>;
  findById(supplierId: string): Promise<Supplier | undefined>;
  findByTaxId(tenantId: string, taxIdValue: string): Promise<Supplier | undefined>;
  findActive(tenantId: string): Promise<readonly Supplier[]>;
}
