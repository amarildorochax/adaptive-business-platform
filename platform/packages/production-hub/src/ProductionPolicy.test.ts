import { describe, expect, it } from 'vitest';
import {
  canRegisterProductionConsumption,
  canRegisterProductionOutput,
  canTransitionProductionOrderStatus,
  computeTotalConsumedCost,
  computeTotalGeneratedQuantity,
  hasSufficientInput,
} from './ProductionPolicy';

describe('ProductionPolicy', () => {
  describe('canTransitionProductionOrderStatus', () => {
    it('permite Planned → InProgress e Planned → Cancelled', () => {
      expect(canTransitionProductionOrderStatus('Planned', 'InProgress')).toBe(true);
      expect(canTransitionProductionOrderStatus('Planned', 'Cancelled')).toBe(true);
    });

    it('permite InProgress → Completed e InProgress → Cancelled', () => {
      expect(canTransitionProductionOrderStatus('InProgress', 'Completed')).toBe(true);
      expect(canTransitionProductionOrderStatus('InProgress', 'Cancelled')).toBe(true);
    });

    it('rejeita qualquer transição a partir de Completed ou Cancelled — estados finais', () => {
      expect(canTransitionProductionOrderStatus('Completed', 'InProgress')).toBe(false);
      expect(canTransitionProductionOrderStatus('Cancelled', 'Planned')).toBe(false);
    });

    it('rejeita Planned → Completed diretamente, sem passar por InProgress', () => {
      expect(canTransitionProductionOrderStatus('Planned', 'Completed')).toBe(false);
    });

    it('rejeita transição para o mesmo estado', () => {
      expect(canTransitionProductionOrderStatus('Planned', 'Planned')).toBe(false);
      expect(canTransitionProductionOrderStatus('InProgress', 'InProgress')).toBe(false);
    });
  });

  describe('canRegisterProductionConsumption / canRegisterProductionOutput', () => {
    it('permitem apenas quando InProgress', () => {
      expect(canRegisterProductionConsumption('InProgress')).toBe(true);
      expect(canRegisterProductionOutput('InProgress')).toBe(true);
    });

    it('rejeitam Planned, Completed e Cancelled', () => {
      for (const status of ['Planned', 'Completed', 'Cancelled'] as const) {
        expect(canRegisterProductionConsumption(status)).toBe(false);
        expect(canRegisterProductionOutput(status)).toBe(false);
      }
    });
  });

  describe('hasSufficientInput', () => {
    const lines = [
      { inputProductId: 'flour', quantityPerOutputUnit: 2 },
      { inputProductId: 'sugar', quantityPerOutputUnit: 1 },
    ];

    it('retorna true quando toda linha tem disponibilidade suficiente para a quantidade planejada', () => {
      const available = new Map([
        ['flour', 20],
        ['sugar', 10],
      ]);
      expect(hasSufficientInput(lines, available, 10)).toBe(true);
    });

    it('retorna false quando ao menos uma linha não tem disponibilidade suficiente', () => {
      const available = new Map([
        ['flour', 19],
        ['sugar', 10],
      ]);
      expect(hasSufficientInput(lines, available, 10)).toBe(false);
    });

    it('trata insumo ausente do mapa como disponibilidade zero', () => {
      const available = new Map([['flour', 100]]);
      expect(hasSufficientInput(lines, available, 1)).toBe(false);
    });

    it('lista de linhas vazia é sempre suficiente', () => {
      expect(hasSufficientInput([], new Map(), 1000)).toBe(true);
    });
  });

  describe('computeTotalConsumedCost', () => {
    it('soma o acquisitionCost de cada consumo', () => {
      expect(computeTotalConsumedCost([{ acquisitionCost: 10 }, { acquisitionCost: 5.5 }])).toBe(15.5);
    });

    it('retorna zero para lista vazia', () => {
      expect(computeTotalConsumedCost([])).toBe(0);
    });
  });

  describe('computeTotalGeneratedQuantity', () => {
    it('soma a quantityGenerated de cada geração', () => {
      expect(computeTotalGeneratedQuantity([{ quantityGenerated: 8 }, { quantityGenerated: 2 }])).toBe(10);
    });

    it('retorna zero para lista vazia', () => {
      expect(computeTotalGeneratedQuantity([])).toBe(0);
    });
  });
});
