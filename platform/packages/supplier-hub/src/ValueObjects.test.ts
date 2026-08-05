import { describe, expect, it } from 'vitest';
import { isValidTaxIdFormat } from './TaxId';
import { isValidMoney } from './Money';
import { isValidPaymentTerms } from './PaymentTerms';

describe('TaxId', () => {
  it('aceita 11 dígitos (CPF) e 14 dígitos (CNPJ), sem máscara', () => {
    expect(isValidTaxIdFormat('12345678901')).toBe(true);
    expect(isValidTaxIdFormat('12345678000199')).toBe(true);
  });

  it('rejeita valor com máscara ou tamanho fora do esperado', () => {
    expect(isValidTaxIdFormat('123.456.789-01')).toBe(false);
    expect(isValidTaxIdFormat('123')).toBe(false);
    expect(isValidTaxIdFormat('')).toBe(false);
  });
});

describe('Money', () => {
  it('é válido quando finito, não negativo e com moeda definida', () => {
    expect(isValidMoney({ amount: 0, currencyCode: 'BRL' })).toBe(true);
    expect(isValidMoney({ amount: 19.9, currencyCode: 'USD' })).toBe(true);
  });

  it('é inválido quando negativo, não finito ou sem moeda', () => {
    expect(isValidMoney({ amount: -1, currencyCode: 'BRL' })).toBe(false);
    expect(isValidMoney({ amount: Number.POSITIVE_INFINITY, currencyCode: 'BRL' })).toBe(false);
    expect(isValidMoney({ amount: 10, currencyCode: '' })).toBe(false);
  });
});

describe('PaymentTerms', () => {
  it('é válido com dueInDays inteiro e não negativo, incluindo zero (à vista)', () => {
    expect(isValidPaymentTerms({ dueInDays: 0 })).toBe(true);
    expect(isValidPaymentTerms({ dueInDays: 30 })).toBe(true);
  });

  it('é inválido com valor negativo ou fracionário', () => {
    expect(isValidPaymentTerms({ dueInDays: -1 })).toBe(false);
    expect(isValidPaymentTerms({ dueInDays: 15.5 })).toBe(false);
  });
});
