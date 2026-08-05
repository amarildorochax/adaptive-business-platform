import { describe, expect, it } from 'vitest';
import {
  InvalidQuantityDeltaError,
  InvalidStockLocationError,
  MovementOriginReferenceRequiredError,
  StockAlertRuleNotFoundError,
  StockReservationExceedsAvailableError,
  StockReservationInvalidStatusTransitionError,
  StockReservationNotFoundError,
} from './InventoryDomainError';

describe('InventoryDomainError', () => {
  it('cada erro carrega um code estável e distinto, útil para tratamento programático', () => {
    expect(new InvalidQuantityDeltaError().code).toBe('INVENTORY_INVALID_QUANTITY_DELTA');
    expect(new MovementOriginReferenceRequiredError('ProductionOutput').code).toBe(
      'INVENTORY_MOVEMENT_ORIGIN_REFERENCE_REQUIRED',
    );
    expect(new StockReservationNotFoundError('reservation-1').code).toBe('STOCK_RESERVATION_NOT_FOUND');
    expect(new StockReservationInvalidStatusTransitionError('Released', 'Active').code).toBe(
      'STOCK_RESERVATION_INVALID_STATUS_TRANSITION',
    );
    expect(new StockReservationExceedsAvailableError('product-1').code).toBe('STOCK_RESERVATION_EXCEEDS_AVAILABLE');
    expect(new StockAlertRuleNotFoundError('rule-1').code).toBe('STOCK_ALERT_RULE_NOT_FOUND');
    expect(new InvalidStockLocationError().code).toBe('INVENTORY_INVALID_STOCK_LOCATION');
  });

  it('cada erro é uma instância real de Error, com name derivado da própria classe', () => {
    const error = new StockReservationNotFoundError('reservation-1');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('StockReservationNotFoundError');
    expect(error.message).toContain('reservation-1');
  });
});
