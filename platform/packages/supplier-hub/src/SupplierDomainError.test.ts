import { describe, expect, it } from 'vitest';
import {
  DuplicateSupplierTaxIdError,
  InvalidMoneyError,
  InvalidTaxIdError,
  SupplierCatalogItemNotFoundError,
  SupplierInvalidStatusTransitionError,
  SupplierNotFoundError,
} from './SupplierDomainError';

describe('SupplierDomainError', () => {
  it('cada erro carrega um code estável e distinto, útil para tratamento programático', () => {
    expect(new SupplierNotFoundError('s-1').code).toBe('SUPPLIER_NOT_FOUND');
    expect(new DuplicateSupplierTaxIdError('123').code).toBe('SUPPLIER_DUPLICATE_TAX_ID');
    expect(new InvalidTaxIdError('123').code).toBe('SUPPLIER_INVALID_TAX_ID');
    expect(new SupplierInvalidStatusTransitionError('Active', 'Active').code).toBe(
      'SUPPLIER_INVALID_STATUS_TRANSITION',
    );
    expect(new InvalidMoneyError().code).toBe('SUPPLIER_INVALID_MONEY');
    expect(new SupplierCatalogItemNotFoundError('item-1').code).toBe('SUPPLIER_CATALOG_ITEM_NOT_FOUND');
  });

  it('cada erro é uma instância real de Error, com name derivado da própria classe', () => {
    const error = new SupplierNotFoundError('s-1');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SupplierNotFoundError');
    expect(error.message).toContain('s-1');
  });
});
