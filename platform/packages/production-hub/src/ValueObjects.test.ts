import { describe, expect, it } from 'vitest';
import { isValidBOMLine } from './BOMLine';
import { isValidProductionConsumption } from './ProductionConsumption';
import { isValidProductionOutput } from './ProductionOutput';

describe('BOMLine', () => {
  describe('isValidBOMLine', () => {
    it('aceita quantityPerOutputUnit positiva', () => {
      expect(isValidBOMLine({ quantityPerOutputUnit: 0.5 })).toBe(true);
    });

    it('rejeita zero, negativo ou não finito', () => {
      expect(isValidBOMLine({ quantityPerOutputUnit: 0 })).toBe(false);
      expect(isValidBOMLine({ quantityPerOutputUnit: -1 })).toBe(false);
      expect(isValidBOMLine({ quantityPerOutputUnit: Number.NaN })).toBe(false);
    });
  });
});

describe('ProductionConsumption', () => {
  describe('isValidProductionConsumption', () => {
    it('aceita quantidade positiva e custo não negativo', () => {
      expect(isValidProductionConsumption({ quantityConsumed: 1, acquisitionCost: 0 })).toBe(true);
      expect(isValidProductionConsumption({ quantityConsumed: 1, acquisitionCost: 10 })).toBe(true);
    });

    it('rejeita quantidade não positiva', () => {
      expect(isValidProductionConsumption({ quantityConsumed: 0, acquisitionCost: 10 })).toBe(false);
      expect(isValidProductionConsumption({ quantityConsumed: -1, acquisitionCost: 10 })).toBe(false);
    });

    it('rejeita custo de aquisição negativo', () => {
      expect(isValidProductionConsumption({ quantityConsumed: 1, acquisitionCost: -0.01 })).toBe(false);
    });

    it('rejeita valores não finitos', () => {
      expect(isValidProductionConsumption({ quantityConsumed: Number.POSITIVE_INFINITY, acquisitionCost: 1 })).toBe(false);
      expect(isValidProductionConsumption({ quantityConsumed: 1, acquisitionCost: Number.NaN })).toBe(false);
    });
  });
});

describe('ProductionOutput', () => {
  describe('isValidProductionOutput', () => {
    it('aceita quantityGenerated positiva', () => {
      expect(isValidProductionOutput({ quantityGenerated: 1 })).toBe(true);
    });

    it('rejeita zero, negativo ou não finito — "perda de processo é registrada, não zerada silenciosamente"', () => {
      expect(isValidProductionOutput({ quantityGenerated: 0 })).toBe(false);
      expect(isValidProductionOutput({ quantityGenerated: -1 })).toBe(false);
      expect(isValidProductionOutput({ quantityGenerated: Number.NaN })).toBe(false);
    });
  });
});
