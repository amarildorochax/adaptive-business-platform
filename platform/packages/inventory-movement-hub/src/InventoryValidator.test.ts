import { describe, expect, it } from 'vitest';
import { InventoryValidator } from './InventoryValidator';

describe('InventoryValidator', () => {
  const validator = new InventoryValidator();

  it('ensureValidQuantityDelta lança InvalidQuantityDeltaError para zero', () => {
    expect(() => validator.ensureValidQuantityDelta(0)).toThrow(/inválida/);
  });

  it('ensureValidQuantityDelta não lança para inteiro positivo ou negativo', () => {
    expect(() => validator.ensureValidQuantityDelta(10)).not.toThrow();
    expect(() => validator.ensureValidQuantityDelta(-10)).not.toThrow();
  });

  it('ensureOriginReferenceProvidedWhenRequired lança quando ProductionOutput não informa originReferenceId', () => {
    expect(() => validator.ensureOriginReferenceProvidedWhenRequired('ProductionOutput', undefined)).toThrow(
      /exige originReferenceId/,
    );
  });

  it('ensureOriginReferenceProvidedWhenRequired não lança quando a origem não exige referência', () => {
    expect(() => validator.ensureOriginReferenceProvidedWhenRequired('Purchase', undefined)).not.toThrow();
  });

  it('ensureOriginReferenceProvidedWhenRequired não lança quando a referência é informada', () => {
    expect(() => validator.ensureOriginReferenceProvidedWhenRequired('ProductionConsumption', 'production-order-1')).not.toThrow();
  });

  it('ensureReservationStatusTransitionAllowed lança para transição ilegítima', () => {
    expect(() => validator.ensureReservationStatusTransitionAllowed('Released', 'Active')).toThrow(
      /Transição de status de Stock Reservation inválida/,
    );
  });

  it('ensureReservationStatusTransitionAllowed não lança para transição legítima', () => {
    expect(() => validator.ensureReservationStatusTransitionAllowed('Active', 'Released')).not.toThrow();
  });

  it('ensureReservationWithinAvailable lança StockReservationExceedsAvailableError acima do disponível', () => {
    expect(() => validator.ensureReservationWithinAvailable('product-1', 5, 10)).toThrow(
      /excede a quantidade disponível/,
    );
  });

  it('ensureReservationWithinAvailable não lança quando dentro do disponível', () => {
    expect(() => validator.ensureReservationWithinAvailable('product-1', 10, 5)).not.toThrow();
    expect(() => validator.ensureReservationWithinAvailable('product-1', 10, 10)).not.toThrow();
  });

  it('ensureValidStockLocationName lança InvalidStockLocationError para nome vazio', () => {
    expect(() => validator.ensureValidStockLocationName('   ')).toThrow(/nome é obrigatório/);
  });

  it('ensureValidStockLocationName não lança para nome válido', () => {
    expect(() => validator.ensureValidStockLocationName('Depósito Central')).not.toThrow();
  });
});
