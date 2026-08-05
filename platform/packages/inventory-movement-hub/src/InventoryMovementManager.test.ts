import { describe, expect, it } from 'vitest';
import { InventoryMovementManager } from './InventoryMovementManager';
import { StockAlertEvaluationService } from './StockAlertEvaluationService';
import { StockLocationService } from './StockLocationService';
import { StockMovementRecordingService } from './StockMovementRecordingService';
import { StockPositionProjectionService } from './StockPositionProjectionService';
import { StockReservationService } from './StockReservationService';
import {
  FakeStockAlertRuleRepository,
  FakeStockLocationRepository,
  FakeStockMovementRepository,
  FakeStockPositionRepository,
  FakeStockReservationRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const movementRepository = new FakeStockMovementRepository();
  const reservationRepository = new FakeStockReservationRepository();
  const positionRepository = new FakeStockPositionRepository(movementRepository, reservationRepository);
  const alertRuleRepository = new FakeStockAlertRuleRepository();
  const locationRepository = new FakeStockLocationRepository();

  return new InventoryMovementManager({
    movements: new StockMovementRecordingService(movementRepository),
    positions: new StockPositionProjectionService(positionRepository),
    reservations: new StockReservationService(reservationRepository, positionRepository, movementRepository),
    alerts: new StockAlertEvaluationService(alertRuleRepository),
    locations: new StockLocationService(locationRepository),
  });
}

describe('InventoryMovementManager — Inventory Movement Hub Core (IMP-401)', () => {
  it('registerStockMovement de origem Purchase produz InventoryReceived seguido de InventoryAdjusted, e recalcula a posição', async () => {
    const manager = buildManager();

    const { result, command, events } = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantityDelta: 10,
      origin: 'Purchase',
      originReferenceId: 'po-1',
    });

    expect(result.movement.quantityDelta).toBe(10);
    expect(result.position.quantityOnHand).toBe(10);
    expect(result.position.quantityAvailable).toBe(10);
    expect(command.type).toBe('RegisterStockMovement');
    expect(events.map((e) => e.type)).toEqual(['InventoryReceived', 'InventoryAdjusted']);
  });

  it('registerStockMovement de origem ManualAdjustment produz apenas InventoryAdjusted — sem Evento de origem catalogado', async () => {
    const manager = buildManager();

    const { events } = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantityDelta: 3,
      origin: 'ManualAdjustment',
    });

    expect(events.map((e) => e.type)).toEqual(['InventoryAdjusted']);
  });

  it('registerStockMovement de origem ProductionOutput exige originReferenceId — nunca criado sem correlação rastreável', async () => {
    const manager = buildManager();

    await expect(
      manager.registerStockMovement({
        tenantId: 'tenant-1',
        productId: 'product-1',
        quantityDelta: 5,
        origin: 'ProductionOutput',
      }),
    ).rejects.toThrow(/exige originReferenceId/);
  });

  it('registerStockMovement soma múltiplas movimentações na mesma Stock Position — Ledger Before Snapshot', async () => {
    const manager = buildManager();

    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    const second = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantityDelta: -4,
      origin: 'SaleReturn',
    });

    expect(second.result.position.quantityOnHand).toBe(6);
  });

  it('registerStockMovement dispara StockAlertTriggered quando a quantidade em mãos cruza o threshold de uma Regra ativa', async () => {
    const manager = buildManager();
    await manager.createStockAlertRule({ tenantId: 'tenant-1', productId: 'product-1', thresholdQuantity: 5 });
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });

    const { events } = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantityDelta: -6,
      origin: 'SaleReturn',
    });

    expect(events.map((e) => e.type)).toEqual(['InventoryAdjusted', 'StockAlertTriggered']);
  });

  it('createStockReservation produz o Event InventoryReserved quando dentro da quantidade disponível', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });

    const { result, events } = await manager.createStockReservation({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantity: 4,
      orderId: 'order-1',
    });

    expect(result.status).toBe('Active');
    expect(events.map((e) => e.type)).toEqual(['InventoryReserved']);
  });

  it('createStockReservation rejeita reserva acima da quantidade disponível — nunca aceita saldo negativo', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 5, origin: 'Purchase', originReferenceId: 'po-1' });

    await expect(
      manager.createStockReservation({ tenantId: 'tenant-1', productId: 'product-1', quantity: 6, orderId: 'order-1' }),
    ).rejects.toThrow(/excede a quantidade disponível/);
  });

  it('createStockReservation rejeita qualquer reserva quando nenhum Stock Movement jamais existiu para o produto', async () => {
    const manager = buildManager();

    await expect(
      manager.createStockReservation({ tenantId: 'tenant-1', productId: 'product-sem-movimentacao', quantity: 1, orderId: 'order-1' }),
    ).rejects.toThrow(/excede a quantidade disponível/);
  });

  it('releaseStockReservation produz o Event InventoryReleased e nunca gera Stock Movement', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    const { result: reservation } = await manager.createStockReservation({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantity: 4,
      orderId: 'order-1',
    });

    const { result, events } = await manager.releaseStockReservation(reservation.reservationId);

    expect(result.status).toBe('Released');
    expect(events.map((e) => e.type)).toEqual(['InventoryReleased']);
    expect(await manager.listStockMovementsByProduct('product-1')).toHaveLength(1);
  });

  it('convertReservationToMovement gera um Stock Movement de saída (SaleFulfillment) e publica apenas InventoryAdjusted', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    const { result: reservation } = await manager.createStockReservation({
      tenantId: 'tenant-1',
      productId: 'product-1',
      quantity: 4,
      orderId: 'order-1',
    });

    const { result, events } = await manager.convertReservationToMovement(reservation.reservationId);

    expect(result.reservation.status).toBe('ConvertedToMovement');
    expect(result.movement.origin).toBe('SaleFulfillment');
    expect(result.movement.quantityDelta).toBe(-4);
    expect(result.position.quantityOnHand).toBe(6);
    expect(events.map((e) => e.type)).toEqual(['InventoryAdjusted']);
  });

  it('createStockLocation, createStockAlertRule e deactivateStockAlertRule retornam events vazio — incompletude documentada', async () => {
    const manager = buildManager();

    const location = await manager.createStockLocation({ tenantId: 'tenant-1', name: 'Depósito Central' });
    expect(location.command.type).toBe('CreateStockLocation');
    expect(location.events).toEqual([]);

    const rule = await manager.createStockAlertRule({ tenantId: 'tenant-1', productId: 'product-1', thresholdQuantity: 5 });
    expect(rule.events).toEqual([]);

    const deactivated = await manager.deactivateStockAlertRule(rule.result.ruleId);
    expect(deactivated.result.active).toBe(false);
    expect(deactivated.events).toEqual([]);
  });

  it('listStockMovementsByOriginReference retorna apenas as movimentações do Purchase Order de origem', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-2', quantityDelta: 3, origin: 'Purchase', originReferenceId: 'po-2' });

    const movements = await manager.listStockMovementsByOriginReference('po-1');

    expect(movements).toHaveLength(1);
    expect(movements[0]?.productId).toBe('product-1');
  });

  it('registerStockMovement de origem ProductionConsumption produz InventoryConsumed quando originReferenceId é informado', async () => {
    const manager = buildManager();

    const { events } = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'input-1',
      quantityDelta: -2,
      origin: 'ProductionConsumption',
      originReferenceId: 'production-order-1',
    });

    expect(events.map((e) => e.type)).toEqual(['InventoryConsumed', 'InventoryAdjusted']);
  });

  it('registerStockMovement de origem ProductionOutput produz InventoryProduced quando originReferenceId é informado', async () => {
    const manager = buildManager();

    const { events } = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'output-1',
      quantityDelta: 3,
      origin: 'ProductionOutput',
      originReferenceId: 'production-order-1',
    });

    expect(events.map((e) => e.type)).toEqual(['InventoryProduced', 'InventoryAdjusted']);
  });

  it('registerStockMovement rejeita QuantityDelta zero', async () => {
    const manager = buildManager();

    await expect(
      manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 0, origin: 'ManualAdjustment' }),
    ).rejects.toThrow(/inválida/);
  });

  it('registerStockMovement mantém Stock Position isolada por locationId — mesmo produto, dois pontos físicos distintos', async () => {
    const manager = buildManager();

    const warehouseA = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      locationId: 'location-a',
      quantityDelta: 10,
      origin: 'Purchase',
      originReferenceId: 'po-1',
    });
    const warehouseB = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-1',
      locationId: 'location-b',
      quantityDelta: 4,
      origin: 'Purchase',
      originReferenceId: 'po-2',
    });

    expect(warehouseA.result.position.quantityOnHand).toBe(10);
    expect(warehouseB.result.position.quantityOnHand).toBe(4);
  });

  it('getStockPosition retorna undefined para um produto sem nenhum Stock Movement registrado', async () => {
    const manager = buildManager();

    expect(await manager.getStockPosition('product-nunca-movimentado')).toBeUndefined();
  });

  it('releaseStockReservation lança StockReservationNotFoundError para identificador inexistente', async () => {
    const manager = buildManager();

    await expect(manager.releaseStockReservation('reservation-inexistente')).rejects.toThrow(/não encontrada/);
  });

  it('releaseStockReservation lança ao tentar liberar uma Reservation já convertida em Movement', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    const { result: reservation } = await manager.createStockReservation({ tenantId: 'tenant-1', productId: 'product-1', quantity: 4, orderId: 'order-1' });
    await manager.convertReservationToMovement(reservation.reservationId);

    await expect(manager.releaseStockReservation(reservation.reservationId)).rejects.toThrow(
      /Transição de status de Stock Reservation inválida/,
    );
  });

  it('convertReservationToMovement lança ao tentar converter uma Reservation já liberada', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    const { result: reservation } = await manager.createStockReservation({ tenantId: 'tenant-1', productId: 'product-1', quantity: 4, orderId: 'order-1' });
    await manager.releaseStockReservation(reservation.reservationId);

    await expect(manager.convertReservationToMovement(reservation.reservationId)).rejects.toThrow(
      /Transição de status de Stock Reservation inválida/,
    );
  });

  it('deactivateStockAlertRule lança StockAlertRuleNotFoundError para identificador inexistente', async () => {
    const manager = buildManager();

    await expect(manager.deactivateStockAlertRule('rule-inexistente')).rejects.toThrow(/não encontrada/);
  });

  it('createStockLocation lança InvalidStockLocationError para nome vazio', async () => {
    const manager = buildManager();

    await expect(manager.createStockLocation({ tenantId: 'tenant-1', name: '   ' })).rejects.toThrow(
      /nome é obrigatório/,
    );
  });

  it('listActiveStockLocations retorna apenas Locations ativas do Tenant', async () => {
    const manager = buildManager();
    await manager.createStockLocation({ tenantId: 'tenant-1', name: 'Depósito A' });
    await manager.createStockLocation({ tenantId: 'tenant-2', name: 'Depósito de Outro Tenant' });

    const locations = await manager.listActiveStockLocations('tenant-1');

    expect(locations).toHaveLength(1);
    expect(locations[0]?.name).toBe('Depósito A');
  });

  it('listStockReservationsByOrder retorna toda Reservation associada ao Order, independente do status', async () => {
    const manager = buildManager();
    await manager.registerStockMovement({ tenantId: 'tenant-1', productId: 'product-1', quantityDelta: 10, origin: 'Purchase', originReferenceId: 'po-1' });
    const { result: reservation } = await manager.createStockReservation({ tenantId: 'tenant-1', productId: 'product-1', quantity: 4, orderId: 'order-1' });
    await manager.releaseStockReservation(reservation.reservationId);

    const reservations = await manager.listStockReservationsByOrder('order-1');

    expect(reservations).toHaveLength(1);
    expect(reservations[0]?.status).toBe('Released');
  });

  it('registerStockMovement nunca dispara StockAlertTriggered quando nenhuma Regra ativa existe para o produto', async () => {
    const manager = buildManager();

    const { events } = await manager.registerStockMovement({
      tenantId: 'tenant-1',
      productId: 'product-sem-regra',
      quantityDelta: 1,
      origin: 'ManualAdjustment',
    });

    expect(events.some((e) => e.type === 'StockAlertTriggered')).toBe(false);
  });
});
