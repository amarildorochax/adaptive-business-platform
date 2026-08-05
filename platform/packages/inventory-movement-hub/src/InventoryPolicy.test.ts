import { describe, expect, it } from 'vitest';
import {
  canTransitionReservationStatus,
  computeQuantityAvailable,
  resolveMovementOriginEvent,
  shouldTriggerStockAlert,
} from './InventoryPolicy';

describe('InventoryPolicy', () => {
  describe('resolveMovementOriginEvent', () => {
    it('mapeia Purchase, ProductionConsumption e ProductionOutput para o Evento específico de origem', () => {
      expect(resolveMovementOriginEvent('Purchase')).toBe('InventoryReceived');
      expect(resolveMovementOriginEvent('ProductionConsumption')).toBe('InventoryConsumed');
      expect(resolveMovementOriginEvent('ProductionOutput')).toBe('InventoryProduced');
    });

    it('retorna undefined para SaleFulfillment, SaleReturn e ManualAdjustment — apenas InventoryAdjusted se aplica', () => {
      expect(resolveMovementOriginEvent('SaleFulfillment')).toBeUndefined();
      expect(resolveMovementOriginEvent('SaleReturn')).toBeUndefined();
      expect(resolveMovementOriginEvent('ManualAdjustment')).toBeUndefined();
    });
  });

  describe('canTransitionReservationStatus', () => {
    it('permite Active → Released e Active → ConvertedToMovement', () => {
      expect(canTransitionReservationStatus('Active', 'Released')).toBe(true);
      expect(canTransitionReservationStatus('Active', 'ConvertedToMovement')).toBe(true);
    });

    it('rejeita qualquer transição a partir de Released ou ConvertedToMovement — estados finais', () => {
      expect(canTransitionReservationStatus('Released', 'Active')).toBe(false);
      expect(canTransitionReservationStatus('ConvertedToMovement', 'Active')).toBe(false);
      expect(canTransitionReservationStatus('Released', 'ConvertedToMovement')).toBe(false);
    });

    it('rejeita transição para o mesmo estado', () => {
      expect(canTransitionReservationStatus('Active', 'Active')).toBe(false);
    });
  });

  describe('computeQuantityAvailable', () => {
    it('subtrai a quantidade reservada da quantidade em mãos', () => {
      expect(computeQuantityAvailable(10, 3)).toBe(7);
    });

    it('pode resultar em zero quando toda a quantidade em mãos está reservada', () => {
      expect(computeQuantityAvailable(5, 5)).toBe(0);
    });
  });

  describe('shouldTriggerStockAlert', () => {
    it('dispara quando a Regra está ativa e a quantidade em mãos está no ou abaixo do threshold', () => {
      expect(shouldTriggerStockAlert({ active: true, thresholdQuantity: 10 }, 10)).toBe(true);
      expect(shouldTriggerStockAlert({ active: true, thresholdQuantity: 10 }, 5)).toBe(true);
    });

    it('não dispara quando a quantidade em mãos está acima do threshold', () => {
      expect(shouldTriggerStockAlert({ active: true, thresholdQuantity: 10 }, 11)).toBe(false);
    });

    it('nunca dispara para uma Regra inativa, mesmo abaixo do threshold', () => {
      expect(shouldTriggerStockAlert({ active: false, thresholdQuantity: 10 }, 0)).toBe(false);
    });
  });
});
