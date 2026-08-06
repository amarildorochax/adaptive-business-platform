import { describe, expect, it } from 'vitest';
import {
  DuplicateTaxRegimeError,
  FiscalDocumentInvalidStatusTransitionError,
  FiscalDocumentMissingOriginError,
  FiscalDocumentNotFoundError,
  FiscalDomainError,
  FiscalObligationInvalidStatusTransitionError,
  FiscalObligationNotFoundError,
  InvalidFiscalDocumentLineError,
  InvalidFiscalObligationError,
  InvalidMoneyError,
  InvalidTaxClassificationError,
  InvalidTaxRateError,
  InvalidTaxRegimeNameError,
  NoApplicableTaxRuleFoundError,
  TaxRegimeNotFoundError,
  TaxRuleNotFoundError,
} from './FiscalDomainError';

describe('FiscalDomainError', () => {
  const errors: readonly FiscalDomainError[] = [
    new TaxRegimeNotFoundError('tenant-1'),
    new DuplicateTaxRegimeError('tenant-1'),
    new InvalidTaxRegimeNameError(),
    new TaxRuleNotFoundError('rule-1'),
    new InvalidTaxClassificationError(),
    new InvalidTaxRateError(),
    new InvalidMoneyError(),
    new NoApplicableTaxRuleFoundError('regime-1'),
    new FiscalDocumentNotFoundError('doc-1'),
    new FiscalDocumentMissingOriginError(),
    new InvalidFiscalDocumentLineError(),
    new FiscalDocumentInvalidStatusTransitionError('Issued', 'Cancelled'),
    new FiscalObligationNotFoundError('obligation-1'),
    new InvalidFiscalObligationError(),
    new FiscalObligationInvalidStatusTransitionError('Fulfilled', 'Pending'),
  ];

  it('toda subclasse estende FiscalDomainError e Error', () => {
    for (const error of errors) {
      expect(error).toBeInstanceOf(FiscalDomainError);
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('toda subclasse possui um code estável e único', () => {
    const codes = errors.map((error) => error.code);
    expect(new Set(codes).size).toBe(codes.length);

    for (const code of codes) {
      expect(code).toMatch(/^FISCAL_/);
    }
  });

  it('o name da instância reflete a subclasse concreta, nunca FiscalDomainError genérico', () => {
    expect(new TaxRegimeNotFoundError('tenant-1').name).toBe('TaxRegimeNotFoundError');
    expect(new FiscalDocumentNotFoundError('doc-1').name).toBe('FiscalDocumentNotFoundError');
  });

  it('mensagens de erro incorporam os identificadores informados', () => {
    expect(new TaxRegimeNotFoundError('tenant-42').message).toContain('tenant-42');
    expect(new FiscalDocumentNotFoundError('doc-42').message).toContain('doc-42');
    expect(new FiscalDocumentInvalidStatusTransitionError('Issued', 'Cancelled').message).toContain('Issued');
    expect(new FiscalDocumentInvalidStatusTransitionError('Issued', 'Cancelled').message).toContain('Cancelled');
  });
});
