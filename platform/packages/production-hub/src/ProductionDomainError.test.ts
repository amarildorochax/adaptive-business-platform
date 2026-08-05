import { describe, expect, it } from 'vitest';
import {
  BillOfMaterialsNotActiveError,
  BillOfMaterialsNotFoundError,
  InvalidBOMLineError,
  InvalidPlannedOutputQuantityError,
  InvalidProductionConsumptionError,
  InvalidProductionOutputError,
  InvalidWorkCenterNameError,
  ProductionConsumptionNotAllowedError,
  ProductionDomainError,
  ProductionOrderHasConsumptionCannotCancelError,
  ProductionOrderHasNoOutputCannotCompleteError,
  ProductionOrderInvalidStatusTransitionError,
  ProductionOrderNotFoundError,
  ProductionOutputNotAllowedError,
} from './ProductionDomainError';

describe('ProductionDomainError', () => {
  const errors: readonly ProductionDomainError[] = [
    new BillOfMaterialsNotFoundError('bom-1'),
    new BillOfMaterialsNotActiveError('bom-1'),
    new InvalidBOMLineError(),
    new InvalidPlannedOutputQuantityError(),
    new ProductionOrderNotFoundError('po-1'),
    new ProductionOrderInvalidStatusTransitionError('Planned', 'Completed'),
    new ProductionConsumptionNotAllowedError('po-1', 'Planned'),
    new ProductionOutputNotAllowedError('po-1', 'Planned'),
    new InvalidProductionConsumptionError(),
    new InvalidProductionOutputError(),
    new ProductionOrderHasNoOutputCannotCompleteError('po-1'),
    new ProductionOrderHasConsumptionCannotCancelError('po-1'),
    new InvalidWorkCenterNameError(),
  ];

  it('toda subclasse estende ProductionDomainError e Error', () => {
    for (const error of errors) {
      expect(error).toBeInstanceOf(ProductionDomainError);
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('toda subclasse possui um code estável e único', () => {
    const codes = errors.map((error) => error.code);
    expect(new Set(codes).size).toBe(codes.length);

    for (const code of codes) {
      expect(code).toMatch(/^PRODUCTION_/);
    }
  });

  it('o name da instância reflete a subclasse concreta, nunca ProductionDomainError genérico', () => {
    expect(new BillOfMaterialsNotFoundError('bom-1').name).toBe('BillOfMaterialsNotFoundError');
    expect(new ProductionOrderNotFoundError('po-1').name).toBe('ProductionOrderNotFoundError');
  });

  it('mensagens de erro incorporam os identificadores informados', () => {
    expect(new BillOfMaterialsNotFoundError('bom-42').message).toContain('bom-42');
    expect(new ProductionOrderNotFoundError('po-42').message).toContain('po-42');
    expect(new ProductionOrderInvalidStatusTransitionError('Planned', 'Completed').message).toContain('Planned');
    expect(new ProductionOrderInvalidStatusTransitionError('Planned', 'Completed').message).toContain('Completed');
  });
});
