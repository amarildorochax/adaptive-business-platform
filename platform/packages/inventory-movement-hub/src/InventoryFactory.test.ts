import { describe, expect, it } from 'vitest';
import { InventoryFactory } from './InventoryFactory';

describe('InventoryFactory', () => {
  const factory = new InventoryFactory();

  it('createStockMovement preserva os campos informados e usa a hora atual quando occurredAt é omitido', () => {
    const movement = factory.createStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantityDelta: 10,
      origin: 'Purchase',
      originReferenceId: 'po-1',
    });

    expect(movement.quantityDelta).toBe(10);
    expect(movement.origin).toBe('Purchase');
    expect(movement.movementId).toBeTruthy();
    expect(movement.occurredAt).toBeInstanceOf(Date);
  });

  it('createStockMovement preserva occurredAt explícito quando informado', () => {
    const occurredAt = new Date('2026-02-01');
    const movement = factory.createStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantityDelta: -5,
      origin: 'SaleFulfillment',
      occurredAt,
    });

    expect(movement.occurredAt).toBe(occurredAt);
  });

  it('createStockReservation gera status Active por padrão', () => {
    const reservation = factory.createStockReservation({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantity: 5,
      orderId: 'order-1',
    });

    expect(reservation.status).toBe('Active');
    expect(reservation.reservationId).toBeTruthy();
    expect(reservation.createdAt).toEqual(reservation.updatedAt);
  });

  it('createStockLocation gera active true por padrão', () => {
    const location = factory.createStockLocation({ tenantId: 'tenant-1', name: 'Depósito Central' });

    expect(location.active).toBe(true);
    expect(location.locationId).toBeTruthy();
    expect(location.address).toBeUndefined();
  });

  it('createStockAlertRule gera active true por padrão', () => {
    const rule = factory.createStockAlertRule({ tenantId: 'tenant-1', productId: 'product-1', thresholdQuantity: 10 });

    expect(rule.active).toBe(true);
    expect(rule.ruleId).toBeTruthy();
    expect(rule.locationId).toBeUndefined();
  });
});
