import { describe, expect, it } from 'vitest';
import { requiresOriginReference } from './MovementOrigin';
import { isValidQuantityDelta } from './QuantityDelta';

describe('QuantityDelta', () => {
  it('é válido quando inteiro e diferente de zero, positivo ou negativo', () => {
    expect(isValidQuantityDelta(10)).toBe(true);
    expect(isValidQuantityDelta(-10)).toBe(true);
    expect(isValidQuantityDelta(1)).toBe(true);
  });

  it('é inválido quando zero — nenhum fato de negócio corresponde a uma movimentação sem efeito', () => {
    expect(isValidQuantityDelta(0)).toBe(false);
  });

  it('é inválido quando não inteiro ou não finito', () => {
    expect(isValidQuantityDelta(1.5)).toBe(false);
    expect(isValidQuantityDelta(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidQuantityDelta(Number.NaN)).toBe(false);
  });
});

describe('MovementOrigin', () => {
  it('exige originReferenceId para ProductionConsumption e ProductionOutput', () => {
    expect(requiresOriginReference('ProductionConsumption')).toBe(true);
    expect(requiresOriginReference('ProductionOutput')).toBe(true);
  });

  it('nunca exige originReferenceId para Purchase, SaleFulfillment, SaleReturn ou ManualAdjustment', () => {
    expect(requiresOriginReference('Purchase')).toBe(false);
    expect(requiresOriginReference('SaleFulfillment')).toBe(false);
    expect(requiresOriginReference('SaleReturn')).toBe(false);
    expect(requiresOriginReference('ManualAdjustment')).toBe(false);
  });
});
