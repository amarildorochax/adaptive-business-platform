import { describe, expect, it } from 'vitest';
import {
  DuplicateTaxRegimeError,
  FiscalDocumentInvalidStatusTransitionError,
  FiscalDocumentMissingOriginError,
  FiscalObligationInvalidStatusTransitionError,
  InvalidFiscalDocumentLineError,
  InvalidFiscalObligationError,
  InvalidMoneyError,
  InvalidTaxClassificationError,
  InvalidTaxRateError,
  InvalidTaxRegimeNameError,
  NoApplicableTaxRuleFoundError,
} from './FiscalDomainError';
import { FiscalValidator } from './FiscalValidator';

describe('FiscalValidator', () => {
  const validator = new FiscalValidator();

  describe('ensureValidTaxRegimeName', () => {
    it('aceita nome não vazio', () => {
      expect(() => validator.ensureValidTaxRegimeName('Simples Nacional')).not.toThrow();
    });

    it('rejeita nome vazio ou apenas espaços', () => {
      expect(() => validator.ensureValidTaxRegimeName('')).toThrow(InvalidTaxRegimeNameError);
      expect(() => validator.ensureValidTaxRegimeName('   ')).toThrow(InvalidTaxRegimeNameError);
    });
  });

  describe('ensureNoDuplicateTaxRegime', () => {
    it('aceita quando nenhum Tax Regime existente é informado', () => {
      expect(() => validator.ensureNoDuplicateTaxRegime('tenant-1', undefined)).not.toThrow();
    });

    it('rejeita quando já existe um Tax Regime para o Tenant', () => {
      const existing = { taxRegimeId: 'regime-1', tenantId: 'tenant-1', name: 'Lucro Presumido', createdAt: new Date() };
      expect(() => validator.ensureNoDuplicateTaxRegime('tenant-1', existing)).toThrow(DuplicateTaxRegimeError);
    });
  });

  describe('ensureValidTaxClassification', () => {
    it('aceita código não vazio', () => {
      expect(() => validator.ensureValidTaxClassification({ code: '1234.56' })).not.toThrow();
    });

    it('rejeita código vazio', () => {
      expect(() => validator.ensureValidTaxClassification({ code: '' })).toThrow(InvalidTaxClassificationError);
    });
  });

  describe('ensureValidTaxRate', () => {
    it('aceita alíquota não negativa', () => {
      expect(() => validator.ensureValidTaxRate({ type: 'Percentage', value: 18 })).not.toThrow();
    });

    it('rejeita alíquota negativa', () => {
      expect(() => validator.ensureValidTaxRate({ type: 'Percentage', value: -1 })).toThrow(InvalidTaxRateError);
    });
  });

  describe('ensureValidMoney', () => {
    it('aceita Money válido', () => {
      expect(() => validator.ensureValidMoney({ amount: 10, currencyCode: 'BRL' })).not.toThrow();
    });

    it('rejeita Money com valor negativo', () => {
      expect(() => validator.ensureValidMoney({ amount: -1, currencyCode: 'BRL' })).toThrow(InvalidMoneyError);
    });
  });

  describe('ensureApplicableTaxRuleFound', () => {
    const rule = {
      taxRuleId: 'rule-1',
      tenantId: 'tenant-1',
      taxRegimeId: 'regime-1',
      classification: { code: '1234' },
      rate: { type: 'Percentage' as const, value: 10 },
      validFrom: new Date('2026-01-01'),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('retorna a regra quando informada', () => {
      expect(validator.ensureApplicableTaxRuleFound(rule, 'regime-1')).toBe(rule);
    });

    it('lança NoApplicableTaxRuleFoundError quando ausente', () => {
      expect(() => validator.ensureApplicableTaxRuleFound(undefined, 'regime-1')).toThrow(NoApplicableTaxRuleFoundError);
    });
  });

  describe('ensureFiscalDocumentHasOrigin', () => {
    it('aceita apenas orderId', () => {
      expect(() => validator.ensureFiscalDocumentHasOrigin('order-1', undefined)).not.toThrow();
    });

    it('aceita apenas invoiceId', () => {
      expect(() => validator.ensureFiscalDocumentHasOrigin(undefined, 'invoice-1')).not.toThrow();
    });

    it('aceita ambos', () => {
      expect(() => validator.ensureFiscalDocumentHasOrigin('order-1', 'invoice-1')).not.toThrow();
    });

    it('rejeita quando nenhum dos dois é informado', () => {
      expect(() => validator.ensureFiscalDocumentHasOrigin(undefined, undefined)).toThrow(FiscalDocumentMissingOriginError);
    });
  });

  describe('ensureValidFiscalDocumentLine', () => {
    const validLine = {
      fiscalDocumentLineId: 'line-1',
      productId: 'product-1',
      quantity: 1,
      unitValue: { amount: 10, currencyCode: 'BRL' },
      classification: { code: '1234' },
      taxCalculation: {
        taxCalculationId: 'calc-1',
        fiscalDocumentLineId: 'line-1',
        taxRuleId: 'rule-1',
        amount: { amount: 1.8, currencyCode: 'BRL' },
        calculatedAt: new Date(),
      },
    };

    it('aceita linha válida', () => {
      expect(() => validator.ensureValidFiscalDocumentLine(validLine)).not.toThrow();
    });

    it('rejeita quantidade não positiva', () => {
      expect(() => validator.ensureValidFiscalDocumentLine({ ...validLine, quantity: 0 })).toThrow(
        InvalidFiscalDocumentLineError,
      );
    });

    it('rejeita valor unitário inválido', () => {
      expect(() =>
        validator.ensureValidFiscalDocumentLine({ ...validLine, unitValue: { amount: -1, currencyCode: 'BRL' } }),
      ).toThrow(InvalidFiscalDocumentLineError);
    });
  });

  describe('ensureFiscalDocumentStatusTransitionAllowed', () => {
    it('aceita Issued → Cancelled', () => {
      expect(() => validator.ensureFiscalDocumentStatusTransitionAllowed('Issued', 'Cancelled')).not.toThrow();
    });

    it('rejeita transição a partir de Cancelled', () => {
      expect(() => validator.ensureFiscalDocumentStatusTransitionAllowed('Cancelled', 'Issued')).toThrow(
        FiscalDocumentInvalidStatusTransitionError,
      );
    });
  });

  describe('ensureValidFiscalObligation', () => {
    it('aceita type e periodicity não vazios', () => {
      expect(() => validator.ensureValidFiscalObligation({ type: 'Declaração', periodicity: 'Mensal' })).not.toThrow();
    });

    it('rejeita type vazio', () => {
      expect(() => validator.ensureValidFiscalObligation({ type: '', periodicity: 'Mensal' })).toThrow(
        InvalidFiscalObligationError,
      );
    });
  });

  describe('ensureFiscalObligationStatusTransitionAllowed', () => {
    it('aceita Pending → Overdue', () => {
      expect(() => validator.ensureFiscalObligationStatusTransitionAllowed('Pending', 'Overdue')).not.toThrow();
    });

    it('rejeita transição a partir de Fulfilled', () => {
      expect(() => validator.ensureFiscalObligationStatusTransitionAllowed('Fulfilled', 'Pending')).toThrow(
        FiscalObligationInvalidStatusTransitionError,
      );
    });
  });
});
