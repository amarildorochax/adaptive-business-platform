import { describe, expect, it } from 'vitest';
import { SupplierFactory } from './SupplierFactory';

describe('SupplierFactory', () => {
  it('createSupplier atribui status Active e lista de contatos vazia por padrão', () => {
    const factory = new SupplierFactory();

    const supplier = factory.createSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Novo',
      taxId: { value: '12345678000199' },
    });

    expect(supplier.status).toBe('Active');
    expect(supplier.contacts).toEqual([]);
    expect(supplier.supplierId).toBeTruthy();
    expect(supplier.createdAt).toBeInstanceOf(Date);
    expect(supplier.updatedAt).toBeInstanceOf(Date);
  });

  it('cada Supplier criado recebe um identificador único', () => {
    const factory = new SupplierFactory();

    const a = factory.createSupplier({ tenantId: 't1', legalName: 'A', taxId: { value: '12345678000199' } });
    const b = factory.createSupplier({ tenantId: 't1', legalName: 'B', taxId: { value: '98765432000199' } });

    expect(a.supplierId).not.toBe(b.supplierId);
  });

  it('createSupplierContact associa o supplierId informado', () => {
    const factory = new SupplierFactory();

    const contact = factory.createSupplierContact({
      supplierId: 'supplier-1',
      name: 'João',
      role: 'Logistics',
    });

    expect(contact.supplierId).toBe('supplier-1');
    expect(contact.role).toBe('Logistics');
  });

  it('createSupplierCatalogItem preserva o Money informado sem transformação', () => {
    const factory = new SupplierFactory();

    const item = factory.createSupplierCatalogItem({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      productId: 'product-1',
      listPrice: { amount: 42, currencyCode: 'BRL' },
      leadTimeInDays: 3,
      minimumOrderQuantity: 5,
    });

    expect(item.listPrice).toEqual({ amount: 42, currencyCode: 'BRL' });
  });

  it('createSupplierContract aceita vigência sem data de término (prazo indeterminado)', () => {
    const factory = new SupplierFactory();

    const contract = factory.createSupplierContract({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      startsAt: new Date('2026-01-01'),
      paymentTerms: { dueInDays: 30 },
    });

    expect(contract.endsAt).toBeUndefined();
  });

  it('createSupplierPerformanceRecord registra o tipo de observação informado', () => {
    const factory = new SupplierFactory();

    const record = factory.createSupplierPerformanceRecord({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      purchaseOrderId: 'po-1',
      observationType: 'OnTimeDelivery',
      observedAt: new Date('2026-01-01'),
    });

    expect(record.observationType).toBe('OnTimeDelivery');
    expect(record.recordId).toBeTruthy();
  });
});
