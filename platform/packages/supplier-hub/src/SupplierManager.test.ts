import { describe, expect, it } from 'vitest';
import { SupplierCatalogService } from './SupplierCatalogService';
import { SupplierContractService } from './SupplierContractService';
import { SupplierManager } from './SupplierManager';
import { SupplierPerformanceService } from './SupplierPerformanceService';
import { SupplierService } from './SupplierService';
import {
  FakeSupplierCatalogItemRepository,
  FakeSupplierContractRepository,
  FakeSupplierPerformanceRepository,
  FakeSupplierRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const supplierRepository = new FakeSupplierRepository();

  return new SupplierManager({
    suppliers: new SupplierService(supplierRepository),
    catalog: new SupplierCatalogService(new FakeSupplierCatalogItemRepository(), supplierRepository),
    contracts: new SupplierContractService(new FakeSupplierContractRepository()),
    performance: new SupplierPerformanceService(new FakeSupplierPerformanceRepository()),
  });
}

describe('SupplierManager — Supplier Hub Core (IMP-201)', () => {
  it('registerSupplier produz Supplier ativo e o Event SupplierRegistered, com Command RegisterSupplier', async () => {
    const manager = buildManager();

    const { result, command, events } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Floricultura Atacado Ltda.',
      taxId: { value: '12345678000199' },
      supplyCategory: 'Flores',
    });

    expect(result.status).toBe('Active');
    expect(result.legalName).toBe('Floricultura Atacado Ltda.');
    expect(command.type).toBe('RegisterSupplier');
    expect(events.map((e) => e.type)).toEqual(['SupplierRegistered']);
  });

  it('registerSupplier rejeita TaxId em formato inválido', async () => {
    const manager = buildManager();

    await expect(
      manager.registerSupplier({
        tenantId: 'tenant-1',
        legalName: 'Fornecedor Inválido',
        taxId: { value: '123' },
      }),
    ).rejects.toThrow(/formato/);
  });

  it('registerSupplier rejeita TaxId duplicado dentro do mesmo Tenant', async () => {
    const manager = buildManager();

    await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Primeiro Fornecedor',
      taxId: { value: '12345678000199' },
    });

    await expect(
      manager.registerSupplier({
        tenantId: 'tenant-1',
        legalName: 'Segundo Fornecedor, mesmo CNPJ',
        taxId: { value: '12345678000199' },
      }),
    ).rejects.toThrow(/Já existe um Supplier/);
  });

  it('o mesmo TaxId é aceito em Tenants diferentes — isolamento absoluto entre Empresas', async () => {
    const manager = buildManager();

    await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Tenant 1',
      taxId: { value: '12345678000199' },
    });

    await expect(
      manager.registerSupplier({
        tenantId: 'tenant-2',
        legalName: 'Fornecedor Tenant 2',
        taxId: { value: '12345678000199' },
      }),
    ).resolves.toBeDefined();
  });

  it('disableSupplier transiciona para Disabled e emite SupplierDisabled', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor a Desabilitar',
      taxId: { value: '12345678000199' },
    });

    const { result, events } = await manager.disableSupplier(created.supplierId);

    expect(result.status).toBe('Disabled');
    expect(events.map((e) => e.type)).toEqual(['SupplierDisabled']);
  });

  it('disableSupplier duas vezes seguidas é rejeitado — transição Disabled → Disabled é inválida', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Duplo Disable',
      taxId: { value: '12345678000199' },
    });

    await manager.disableSupplier(created.supplierId);

    await expect(manager.disableSupplier(created.supplierId)).rejects.toThrow(/Transição de status inválida/);
  });

  it('reactivateSupplier transiciona de volta para Active e emite SupplierReactivated', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor a Reativar',
      taxId: { value: '12345678000199' },
    });
    await manager.disableSupplier(created.supplierId);

    const { result, events } = await manager.reactivateSupplier(created.supplierId);

    expect(result.status).toBe('Active');
    expect(events.map((e) => e.type)).toEqual(['SupplierReactivated']);
  });

  it('updateSupplier altera legalName e emite SupplierUpdated', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Nome Antigo',
      taxId: { value: '12345678000199' },
    });

    const { result, events } = await manager.updateSupplier(created.supplierId, {
      legalName: 'Nome Novo',
    });

    expect(result.legalName).toBe('Nome Novo');
    expect(events.map((e) => e.type)).toEqual(['SupplierUpdated']);
  });

  it('addSupplierContact adiciona o contato ao Supplier sem publicar nenhum Evento — incompletude documentada do catálogo', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor com Contato',
      taxId: { value: '12345678000199' },
    });

    const { result, command, events } = await manager.addSupplierContact(created.supplierId, {
      name: 'Maria Souza',
      role: 'Commercial',
    });

    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0]?.name).toBe('Maria Souza');
    expect(command.type).toBe('AddSupplierContact');
    expect(events).toEqual([]);
  });

  it('registerSupplierCatalogItem associa Fornecedor a Produto e emite SupplierCatalogItemRegistered', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor de Catálogo',
      taxId: { value: '12345678000199' },
    });

    const { result, events } = await manager.registerSupplierCatalogItem({
      supplierId: created.supplierId,
      tenantId: 'tenant-1',
      productId: 'product-1',
      listPrice: { amount: 19.9, currencyCode: 'BRL' },
      leadTimeInDays: 5,
      minimumOrderQuantity: 10,
    });

    expect(result.productId).toBe('product-1');
    expect(events.map((e) => e.type)).toEqual(['SupplierCatalogItemRegistered']);
  });

  it('registerSupplierCatalogItem rejeita Money inválido (valor negativo)', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor de Catálogo Inválido',
      taxId: { value: '12345678000199' },
    });

    await expect(
      manager.registerSupplierCatalogItem({
        supplierId: created.supplierId,
        tenantId: 'tenant-1',
        productId: 'product-1',
        listPrice: { amount: -1, currencyCode: 'BRL' },
        leadTimeInDays: 5,
        minimumOrderQuantity: 10,
      }),
    ).rejects.toThrow(/Valor monetário inválido/);
  });

  it('updateSupplierCatalogItem altera o preço de tabela sem publicar Evento — mesma incompletude documentada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor de Catálogo',
      taxId: { value: '12345678000199' },
    });
    const { result: item } = await manager.registerSupplierCatalogItem({
      supplierId: created.supplierId,
      tenantId: 'tenant-1',
      productId: 'product-1',
      listPrice: { amount: 19.9, currencyCode: 'BRL' },
      leadTimeInDays: 5,
      minimumOrderQuantity: 10,
    });

    const { result, events } = await manager.updateSupplierCatalogItem(item.catalogItemId, {
      listPrice: { amount: 21.5, currencyCode: 'BRL' },
    });

    expect(result.listPrice.amount).toBe(21.5);
    expect(events).toEqual([]);
  });

  it('createSupplierContract registra o acordo comercial e emite SupplierContractCreated', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor com Contrato',
      taxId: { value: '12345678000199' },
    });

    const { result, events } = await manager.createSupplierContract({
      supplierId: created.supplierId,
      tenantId: 'tenant-1',
      startsAt: new Date('2026-01-01'),
      paymentTerms: { dueInDays: 30 },
    });

    expect(result.paymentTerms.dueInDays).toBe(30);
    expect(events.map((e) => e.type)).toEqual(['SupplierContractCreated']);
  });

  it('recordSupplierPerformance deriva OnTimeDelivery e QuantityMatch quando tudo confere', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Pontual',
      taxId: { value: '12345678000199' },
    });

    const { result, events } = await manager.recordSupplierPerformance({
      supplierId: created.supplierId,
      tenantId: 'tenant-1',
      purchaseOrderId: 'po-1',
      promisedAt: new Date('2026-01-10'),
      receivedAt: new Date('2026-01-09'),
      quantityOrdered: 100,
      quantityReceived: 100,
    });

    expect(result.map((r) => r.observationType)).toEqual(['OnTimeDelivery', 'QuantityMatch']);
    expect(events.map((e) => e.type)).toEqual(['SupplierPerformanceRecorded', 'SupplierPerformanceRecorded']);
  });

  it('recordSupplierPerformance deriva LateDelivery e QuantityMismatch quando o recebimento diverge', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Atrasado',
      taxId: { value: '12345678000199' },
    });

    const { result } = await manager.recordSupplierPerformance({
      supplierId: created.supplierId,
      tenantId: 'tenant-1',
      purchaseOrderId: 'po-2',
      promisedAt: new Date('2026-01-10'),
      receivedAt: new Date('2026-01-15'),
      quantityOrdered: 100,
      quantityReceived: 80,
    });

    expect(result.map((r) => r.observationType)).toEqual(['LateDelivery', 'QuantityMismatch']);
  });

  it('getSupplier e listActiveSuppliers refletem o estado real, nunca uma cópia divergente', async () => {
    const manager = buildManager();
    const { result: created } = await manager.registerSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Consultável',
      taxId: { value: '12345678000199' },
    });

    const fetched = await manager.getSupplier(created.supplierId);
    const active = await manager.listActiveSuppliers('tenant-1');

    expect(fetched?.supplierId).toBe(created.supplierId);
    expect(active).toHaveLength(1);

    await manager.disableSupplier(created.supplierId);
    expect(await manager.listActiveSuppliers('tenant-1')).toHaveLength(0);
  });

  it('operações sobre um Supplier inexistente lançam SupplierNotFoundError', async () => {
    const manager = buildManager();

    await expect(manager.disableSupplier('supplier-inexistente')).rejects.toThrow(/não encontrado/);
  });
});
