import { describe, expect, it } from 'vitest';
import { addMoney, isValidMoney } from './Money';
import { isWithinApprovalThreshold } from './ApprovalThreshold';
import { isValidReceivingLine } from './ReceivingLine';

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

  it('addMoney soma o valor mantendo a moeda do primeiro operando', () => {
    expect(addMoney({ amount: 10, currencyCode: 'BRL' }, { amount: 5, currencyCode: 'BRL' })).toEqual({
      amount: 15,
      currencyCode: 'BRL',
    });
  });
});

describe('ApprovalThreshold', () => {
  it('está dentro do teto quando o total é menor ou igual ao limite, na mesma moeda', () => {
    expect(
      isWithinApprovalThreshold({ amount: 100, currencyCode: 'BRL' }, { limit: { amount: 100, currencyCode: 'BRL' } }),
    ).toBe(true);
  });

  it('está fora do teto quando o total excede o limite', () => {
    expect(
      isWithinApprovalThreshold({ amount: 150, currencyCode: 'BRL' }, { limit: { amount: 100, currencyCode: 'BRL' } }),
    ).toBe(false);
  });

  it('está fora do teto quando a moeda diverge, mesmo com valor menor', () => {
    expect(
      isWithinApprovalThreshold({ amount: 10, currencyCode: 'USD' }, { limit: { amount: 100, currencyCode: 'BRL' } }),
    ).toBe(false);
  });
});

describe('ReceivingLine', () => {
  it('é válida quando a quantidade recebida é positiva', () => {
    expect(isValidReceivingLine({ purchaseOrderItemId: 'item-1', quantityReceived: 1 })).toBe(true);
  });

  it('é inválida quando a quantidade recebida é zero ou negativa', () => {
    expect(isValidReceivingLine({ purchaseOrderItemId: 'item-1', quantityReceived: 0 })).toBe(false);
    expect(isValidReceivingLine({ purchaseOrderItemId: 'item-1', quantityReceived: -1 })).toBe(false);
  });
});
