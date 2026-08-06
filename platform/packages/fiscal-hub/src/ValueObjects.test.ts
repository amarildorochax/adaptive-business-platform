import { describe, expect, it } from 'vitest';
import { isValidFiscalDocumentLine } from './FiscalDocumentLine';
import { isValidFiscalObligation } from './FiscalObligation';
import { isValidMoney } from './Money';
import { isValidTaxClassification } from './TaxClassification';
import { isValidTaxRate } from './TaxRate';

describe('Money', () => {
  describe('isValidMoney', () => {
    it('aceita valor não negativo com moeda informada', () => {
      expect(isValidMoney({ amount: 0, currencyCode: 'BRL' })).toBe(true);
      expect(isValidMoney({ amount: 19.9, currencyCode: 'USD' })).toBe(true);
    });

    it('rejeita valor negativo, não finito, ou moeda vazia', () => {
      expect(isValidMoney({ amount: -1, currencyCode: 'BRL' })).toBe(false);
      expect(isValidMoney({ amount: Number.POSITIVE_INFINITY, currencyCode: 'BRL' })).toBe(false);
      expect(isValidMoney({ amount: 10, currencyCode: '' })).toBe(false);
    });
  });
});

describe('TaxClassification', () => {
  describe('isValidTaxClassification', () => {
    it('aceita código não vazio', () => {
      expect(isValidTaxClassification({ code: '1234.56.78' })).toBe(true);
    });

    it('rejeita código vazio ou apenas espaços', () => {
      expect(isValidTaxClassification({ code: '' })).toBe(false);
      expect(isValidTaxClassification({ code: '   ' })).toBe(false);
    });
  });
});

describe('TaxRate', () => {
  describe('isValidTaxRate', () => {
    it('aceita valor não negativo, percentual ou fixo', () => {
      expect(isValidTaxRate({ type: 'Percentage', value: 18 })).toBe(true);
      expect(isValidTaxRate({ type: 'Fixed', value: 0 })).toBe(true);
    });

    it('rejeita valor negativo ou não finito', () => {
      expect(isValidTaxRate({ type: 'Percentage', value: -1 })).toBe(false);
      expect(isValidTaxRate({ type: 'Fixed', value: Number.NaN })).toBe(false);
    });
  });
});

describe('FiscalDocumentLine', () => {
  describe('isValidFiscalDocumentLine', () => {
    it('aceita quantidade positiva e valor unitário válido', () => {
      expect(isValidFiscalDocumentLine({ quantity: 1, unitValue: { amount: 10, currencyCode: 'BRL' } })).toBe(true);
    });

    it('rejeita quantidade não positiva', () => {
      expect(isValidFiscalDocumentLine({ quantity: 0, unitValue: { amount: 10, currencyCode: 'BRL' } })).toBe(false);
      expect(isValidFiscalDocumentLine({ quantity: -1, unitValue: { amount: 10, currencyCode: 'BRL' } })).toBe(false);
    });

    it('rejeita valor unitário inválido', () => {
      expect(isValidFiscalDocumentLine({ quantity: 1, unitValue: { amount: -1, currencyCode: 'BRL' } })).toBe(false);
    });
  });
});

describe('FiscalObligation', () => {
  describe('isValidFiscalObligation', () => {
    it('aceita type e periodicity não vazios', () => {
      expect(isValidFiscalObligation({ type: 'Declaração', periodicity: 'Mensal' })).toBe(true);
    });

    it('rejeita type ou periodicity vazios', () => {
      expect(isValidFiscalObligation({ type: '', periodicity: 'Mensal' })).toBe(false);
      expect(isValidFiscalObligation({ type: 'Declaração', periodicity: '' })).toBe(false);
    });
  });
});
