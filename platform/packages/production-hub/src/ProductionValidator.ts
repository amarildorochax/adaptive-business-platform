import { isValidBOMLine, type BOMLine } from './BOMLine';
import type { BillOfMaterialsStatus } from './BillOfMaterials';
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
import {
  canRegisterProductionConsumption,
  canRegisterProductionOutput,
  canTransitionProductionOrderStatus,
} from './ProductionPolicy';
import { isValidProductionConsumption, type ProductionConsumption } from './ProductionConsumption';
import { isValidProductionOutput, type ProductionOutput } from './ProductionOutput';
import type { ProductionStatus } from './ProductionOrder';

/**
 * ProductionValidator — a implementação real das validações de domínio do Production Hub, mesma
 * disciplina de `InventoryValidator`/`PurchaseValidator`: lança `ProductionDomainError` de fato,
 * nunca apenas um catálogo declarativo de regras adiado para um "Validation Engine" futuro. Consulta
 * `ProductionPolicy` (pura) antes de decidir se lança.
 */
export class ProductionValidator {
  /** Validação de `BOMLine`. */
  ensureValidBOMLine(line: BOMLine): void {
    if (!isValidBOMLine(line)) {
      throw new InvalidBOMLineError();
    }
  }

  /**
   * Toda `ProductionOrder` referencia exatamente uma `BillOfMaterials` ativa no momento de sua
   * criação; toda `SupersedeBillOfMaterials` só se aplica a uma versão já ativa (`PRODUCTION_HUB.md`,
   * Capítulo 11).
   */
  ensureBillOfMaterialsActive(billOfMaterialsId: string, status: BillOfMaterialsStatus): void {
    if (status !== 'Active') {
      throw new BillOfMaterialsNotActiveError(billOfMaterialsId);
    }
  }

  /** `CreateProductionOrder` exige `plannedOutputQuantity` positiva. */
  ensureValidPlannedOutputQuantity(quantity: number): void {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new InvalidPlannedOutputQuantityError();
    }
  }

  /** "Status" — a transição de status de ProductionOrder solicitada é legítima. */
  ensureProductionOrderStatusTransitionAllowed(from: ProductionStatus, to: ProductionStatus): void {
    if (!canTransitionProductionOrderStatus(from, to)) {
      throw new ProductionOrderInvalidStatusTransitionError(from, to);
    }
  }

  /** Consumo só é registrado enquanto a ProductionOrder está `InProgress`. */
  ensureCanRegisterConsumption(productionOrderId: string, status: ProductionStatus): void {
    if (!canRegisterProductionConsumption(status)) {
      throw new ProductionConsumptionNotAllowedError(productionOrderId, status);
    }
  }

  /** Geração só é registrada enquanto a ProductionOrder está `InProgress`. */
  ensureCanRegisterOutput(productionOrderId: string, status: ProductionStatus): void {
    if (!canRegisterProductionOutput(status)) {
      throw new ProductionOutputNotAllowedError(productionOrderId, status);
    }
  }

  /** Validação de `ProductionConsumption`. */
  ensureValidProductionConsumption(consumption: ProductionConsumption): void {
    if (!isValidProductionConsumption(consumption)) {
      throw new InvalidProductionConsumptionError();
    }
  }

  /** Validação de `ProductionOutput`. */
  ensureValidProductionOutput(output: ProductionOutput): void {
    if (!isValidProductionOutput(output)) {
      throw new InvalidProductionOutputError();
    }
  }

  /**
   * "ProductionCompleted só é publicado após ProductionOutput correspondente já ter sido registrado,
   * nunca a ordem inversa" (`PRODUCTION_HUB.md`, Capítulo 11) — checagem específica antecede a
   * consulta genérica à máquina de estados, mesma disciplina de
   * `PurchaseValidator.ensureCanCancelPurchaseOrder`.
   */
  ensureCanCompleteProduction(productionOrderId: string, status: ProductionStatus, outputsCount: number): void {
    if (outputsCount === 0) {
      throw new ProductionOrderHasNoOutputCannotCompleteError(productionOrderId);
    }

    this.ensureProductionOrderStatusTransitionAllowed(status, 'Completed');
  }

  /**
   * "Um Production Order só é cancelável antes de qualquer ProductionConsumption já registrado"
   * (`PRODUCTION_HUB.md`, Capítulo 11/ADR-PD-004) — checagem específica antecede a consulta genérica
   * à máquina de estados.
   */
  ensureCanCancelProduction(productionOrderId: string, status: ProductionStatus, consumptionsCount: number): void {
    if (consumptionsCount > 0) {
      throw new ProductionOrderHasConsumptionCannotCancelError(productionOrderId);
    }

    this.ensureProductionOrderStatusTransitionAllowed(status, 'Cancelled');
  }

  /** O nome de um `WorkCenter` é obrigatório e não pode ser vazio. */
  ensureValidWorkCenterName(name: string): void {
    if (name.trim().length === 0) {
      throw new InvalidWorkCenterNameError();
    }
  }
}
