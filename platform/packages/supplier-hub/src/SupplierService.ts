import { SupplierFactory, type CreateSupplierContactInput, type CreateSupplierInput } from './SupplierFactory';
import type { Supplier } from './Supplier';
import { SupplierNotFoundError } from './SupplierDomainError';
import type { SupplierRepository } from './SupplierRepository';
import { SupplierValidator } from './SupplierValidator';

/**
 * SupplierService — o Service base do Aggregate Root `Supplier` (registro, atualização,
 * desabilitação, reativação, associação de contato). `SUPPLIER_HUB.md`, Capítulo 10, nomeia
 * explicitamente apenas `SupplierCatalogService` e `SupplierPerformanceService` — este Service
 * base, análogo a `CustomerService`/`ProductService` em cada Hub já implementado, é uma
 * complementação natural de implementação, não uma decisão de arquitetura nova; documentado em
 * `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 3.
 */
export class SupplierService {
  private readonly factory = new SupplierFactory();
  private readonly validator: SupplierValidator;

  constructor(private readonly repository: SupplierRepository) {
    this.validator = new SupplierValidator(repository);
  }

  async register(input: CreateSupplierInput): Promise<Supplier> {
    this.validator.ensureValidTaxId(input.taxId);
    await this.validator.ensureNoDuplicateTaxId(input.tenantId, input.taxId);

    const supplier = this.factory.createSupplier(input);
    return this.repository.create(supplier);
  }

  async update(
    supplierId: string,
    input: Partial<Pick<Supplier, 'legalName' | 'supplyCategory' | 'taxId'>>,
  ): Promise<Supplier> {
    const existing = await this.getOrThrow(supplierId);

    if (input.taxId) {
      this.validator.ensureValidTaxId(input.taxId);
      await this.validator.ensureNoDuplicateTaxId(existing.tenantId, input.taxId, supplierId);
    }

    return this.repository.update({ ...existing, ...input, updatedAt: new Date() });
  }

  async disable(supplierId: string): Promise<Supplier> {
    const existing = await this.getOrThrow(supplierId);
    this.validator.ensureStatusTransitionAllowed(existing.status, 'Disabled');

    return this.repository.update({ ...existing, status: 'Disabled', updatedAt: new Date() });
  }

  async reactivate(supplierId: string): Promise<Supplier> {
    const existing = await this.getOrThrow(supplierId);
    this.validator.ensureStatusTransitionAllowed(existing.status, 'Active');

    return this.repository.update({ ...existing, status: 'Active', updatedAt: new Date() });
  }

  async addContact(supplierId: string, input: Omit<CreateSupplierContactInput, 'supplierId'>): Promise<Supplier> {
    const existing = await this.getOrThrow(supplierId);
    const contact = this.factory.createSupplierContact({ ...input, supplierId });

    return this.repository.update({
      ...existing,
      contacts: [...existing.contacts, contact],
      updatedAt: new Date(),
    });
  }

  async get(supplierId: string): Promise<Supplier | undefined> {
    return this.repository.findById(supplierId);
  }

  async listActive(tenantId: string): Promise<readonly Supplier[]> {
    return this.repository.findActive(tenantId);
  }

  private async getOrThrow(supplierId: string): Promise<Supplier> {
    const existing = await this.repository.findById(supplierId);

    if (!existing) {
      throw new SupplierNotFoundError(supplierId);
    }

    return existing;
  }
}
