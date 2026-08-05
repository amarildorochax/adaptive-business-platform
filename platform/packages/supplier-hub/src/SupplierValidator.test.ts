import { describe, expect, it } from 'vitest';
import { SupplierValidator } from './SupplierValidator';
import { FakeSupplierRepository } from './testing/InMemoryFakes';
import { SupplierFactory } from './SupplierFactory';

describe('SupplierValidator', () => {
  it('ensureValidTaxId aceita CNPJ (14 dígitos) e CPF (11 dígitos)', () => {
    const validator = new SupplierValidator(new FakeSupplierRepository());

    expect(() => validator.ensureValidTaxId({ value: '12345678000199' })).not.toThrow();
    expect(() => validator.ensureValidTaxId({ value: '12345678901' })).not.toThrow();
  });

  it('ensureValidTaxId rejeita formato inválido', () => {
    const validator = new SupplierValidator(new FakeSupplierRepository());

    expect(() => validator.ensureValidTaxId({ value: '123' })).toThrow(/formato/);
    expect(() => validator.ensureValidTaxId({ value: 'abc12345678901' })).toThrow(/formato/);
  });

  it('ensureNoDuplicateTaxId rejeita TaxId já cadastrado no mesmo Tenant', async () => {
    const repository = new FakeSupplierRepository();
    const factory = new SupplierFactory();
    const validator = new SupplierValidator(repository);

    const existing = factory.createSupplier({
      tenantId: 'tenant-1',
      legalName: 'Já Cadastrado',
      taxId: { value: '12345678000199' },
    });
    await repository.create(existing);

    await expect(
      validator.ensureNoDuplicateTaxId('tenant-1', { value: '12345678000199' }),
    ).rejects.toThrow(/Já existe um Supplier/);
  });

  it('ensureNoDuplicateTaxId exclui o próprio Supplier ao validar uma atualização', async () => {
    const repository = new FakeSupplierRepository();
    const factory = new SupplierFactory();
    const validator = new SupplierValidator(repository);

    const existing = factory.createSupplier({
      tenantId: 'tenant-1',
      legalName: 'Fornecedor Existente',
      taxId: { value: '12345678000199' },
    });
    await repository.create(existing);

    await expect(
      validator.ensureNoDuplicateTaxId('tenant-1', { value: '12345678000199' }, existing.supplierId),
    ).resolves.toBeUndefined();
  });

  it('ensureStatusTransitionAllowed delega à SupplierPolicy e lança em transição ilegal', () => {
    const validator = new SupplierValidator(new FakeSupplierRepository());

    expect(() => validator.ensureStatusTransitionAllowed('Active', 'Disabled')).not.toThrow();
    expect(() => validator.ensureStatusTransitionAllowed('Active', 'Active')).toThrow(
      /Transição de status inválida/,
    );
  });

  it('ensureValidMoney rejeita valor negativo e moeda ausente', () => {
    const validator = new SupplierValidator(new FakeSupplierRepository());

    expect(() => validator.ensureValidMoney({ amount: 10, currencyCode: 'BRL' })).not.toThrow();
    expect(() => validator.ensureValidMoney({ amount: -1, currencyCode: 'BRL' })).toThrow(
      /Valor monetário inválido/,
    );
    expect(() => validator.ensureValidMoney({ amount: 10, currencyCode: '' })).toThrow(
      /Valor monetário inválido/,
    );
  });
});
