import { describe, expect, it } from 'vitest';
import {
  BillOfMaterialsNotActiveError,
  InvalidBOMLineError,
  InvalidPlannedOutputQuantityError,
  InvalidProductionConsumptionError,
  InvalidProductionOutputError,
  InvalidWorkCenterNameError,
  ProductionConsumptionNotAllowedError,
  ProductionOrderHasConsumptionCannotCancelError,
  ProductionOrderHasNoOutputCannotCompleteError,
  ProductionOrderInvalidStatusTransitionError,
  ProductionOutputNotAllowedError,
} from './ProductionDomainError';
import { ProductionValidator } from './ProductionValidator';

describe('ProductionValidator', () => {
  const validator = new ProductionValidator();

  describe('ensureValidBOMLine', () => {
    it('aceita uma BOMLine com quantidade positiva', () => {
      expect(() => validator.ensureValidBOMLine({ inputProductId: 'flour', quantityPerOutputUnit: 1, unitOfMeasure: 'Kilogram' })).not.toThrow();
    });

    it('rejeita quantidade zero ou negativa', () => {
      expect(() => validator.ensureValidBOMLine({ inputProductId: 'flour', quantityPerOutputUnit: 0, unitOfMeasure: 'Kilogram' })).toThrow(InvalidBOMLineError);
      expect(() => validator.ensureValidBOMLine({ inputProductId: 'flour', quantityPerOutputUnit: -1, unitOfMeasure: 'Kilogram' })).toThrow(InvalidBOMLineError);
    });
  });

  describe('ensureBillOfMaterialsActive', () => {
    it('aceita status Active', () => {
      expect(() => validator.ensureBillOfMaterialsActive('bom-1', 'Active')).not.toThrow();
    });

    it('rejeita status Superseded', () => {
      expect(() => validator.ensureBillOfMaterialsActive('bom-1', 'Superseded')).toThrow(BillOfMaterialsNotActiveError);
    });
  });

  describe('ensureValidPlannedOutputQuantity', () => {
    it('aceita quantidade positiva', () => {
      expect(() => validator.ensureValidPlannedOutputQuantity(10)).not.toThrow();
    });

    it('rejeita zero, negativo ou não finito', () => {
      expect(() => validator.ensureValidPlannedOutputQuantity(0)).toThrow(InvalidPlannedOutputQuantityError);
      expect(() => validator.ensureValidPlannedOutputQuantity(-5)).toThrow(InvalidPlannedOutputQuantityError);
      expect(() => validator.ensureValidPlannedOutputQuantity(Number.POSITIVE_INFINITY)).toThrow(InvalidPlannedOutputQuantityError);
    });
  });

  describe('ensureProductionOrderStatusTransitionAllowed', () => {
    it('aceita transição permitida', () => {
      expect(() => validator.ensureProductionOrderStatusTransitionAllowed('Planned', 'InProgress')).not.toThrow();
    });

    it('rejeita transição não permitida', () => {
      expect(() => validator.ensureProductionOrderStatusTransitionAllowed('Planned', 'Completed')).toThrow(
        ProductionOrderInvalidStatusTransitionError,
      );
    });
  });

  describe('ensureCanRegisterConsumption / ensureCanRegisterOutput', () => {
    it('aceitam apenas quando InProgress', () => {
      expect(() => validator.ensureCanRegisterConsumption('po-1', 'InProgress')).not.toThrow();
      expect(() => validator.ensureCanRegisterOutput('po-1', 'InProgress')).not.toThrow();
    });

    it('rejeitam quando não InProgress', () => {
      expect(() => validator.ensureCanRegisterConsumption('po-1', 'Planned')).toThrow(ProductionConsumptionNotAllowedError);
      expect(() => validator.ensureCanRegisterOutput('po-1', 'Planned')).toThrow(ProductionOutputNotAllowedError);
    });
  });

  describe('ensureValidProductionConsumption / ensureValidProductionOutput', () => {
    it('aceitam registros válidos', () => {
      expect(() =>
        validator.ensureValidProductionConsumption({
          consumptionId: 'c-1',
          productionOrderId: 'po-1',
          inputProductId: 'flour',
          quantityConsumed: 1,
          acquisitionCost: 0,
          consumedAt: new Date(),
        }),
      ).not.toThrow();

      expect(() =>
        validator.ensureValidProductionOutput({
          outputId: 'o-1',
          productionOrderId: 'po-1',
          outputProductId: 'bread',
          quantityGenerated: 1,
          generatedAt: new Date(),
        }),
      ).not.toThrow();
    });

    it('rejeitam quantidade não positiva', () => {
      expect(() =>
        validator.ensureValidProductionConsumption({
          consumptionId: 'c-1',
          productionOrderId: 'po-1',
          inputProductId: 'flour',
          quantityConsumed: 0,
          acquisitionCost: 0,
          consumedAt: new Date(),
        }),
      ).toThrow(InvalidProductionConsumptionError);

      expect(() =>
        validator.ensureValidProductionOutput({
          outputId: 'o-1',
          productionOrderId: 'po-1',
          outputProductId: 'bread',
          quantityGenerated: 0,
          generatedAt: new Date(),
        }),
      ).toThrow(InvalidProductionOutputError);
    });

    it('rejeita acquisitionCost negativo', () => {
      expect(() =>
        validator.ensureValidProductionConsumption({
          consumptionId: 'c-1',
          productionOrderId: 'po-1',
          inputProductId: 'flour',
          quantityConsumed: 1,
          acquisitionCost: -1,
          consumedAt: new Date(),
        }),
      ).toThrow(InvalidProductionConsumptionError);
    });
  });

  describe('ensureCanCompleteProduction', () => {
    it('aceita InProgress com ao menos uma geração registrada', () => {
      expect(() => validator.ensureCanCompleteProduction('po-1', 'InProgress', 1)).not.toThrow();
    });

    it('rejeita quando nenhuma geração foi registrada', () => {
      expect(() => validator.ensureCanCompleteProduction('po-1', 'InProgress', 0)).toThrow(
        ProductionOrderHasNoOutputCannotCompleteError,
      );
    });

    it('rejeita quando status não permite a transição, mesmo com geração registrada', () => {
      expect(() => validator.ensureCanCompleteProduction('po-1', 'Planned', 1)).toThrow(ProductionOrderInvalidStatusTransitionError);
    });
  });

  describe('ensureCanCancelProduction', () => {
    it('aceita Planned ou InProgress sem nenhum consumo registrado', () => {
      expect(() => validator.ensureCanCancelProduction('po-1', 'Planned', 0)).not.toThrow();
      expect(() => validator.ensureCanCancelProduction('po-1', 'InProgress', 0)).not.toThrow();
    });

    it('rejeita quando já existe consumo registrado, mesmo em status cancelável', () => {
      expect(() => validator.ensureCanCancelProduction('po-1', 'InProgress', 1)).toThrow(
        ProductionOrderHasConsumptionCannotCancelError,
      );
    });

    it('rejeita quando status já é terminal', () => {
      expect(() => validator.ensureCanCancelProduction('po-1', 'Completed', 0)).toThrow(ProductionOrderInvalidStatusTransitionError);
    });
  });

  describe('ensureValidWorkCenterName', () => {
    it('aceita nome não vazio', () => {
      expect(() => validator.ensureValidWorkCenterName('Linha 1')).not.toThrow();
    });

    it('rejeita nome vazio ou apenas espaços', () => {
      expect(() => validator.ensureValidWorkCenterName('')).toThrow(InvalidWorkCenterNameError);
      expect(() => validator.ensureValidWorkCenterName('   ')).toThrow(InvalidWorkCenterNameError);
    });
  });
});
