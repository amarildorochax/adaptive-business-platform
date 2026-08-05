import type { BillOfMaterials } from './BillOfMaterials';
import type { BOMLine } from './BOMLine';
import type { ProductionConsumption } from './ProductionConsumption';
import type { ProductionOrder } from './ProductionOrder';
import type { ProductionOutput } from './ProductionOutput';
import type { WorkCenter } from './WorkCenter';

/**
 * ProductionFactory — construção de cada Entidade do Production Hub, isolando geração de
 * identificador e atribuição de padrão (`status: 'Active'`/`'Planned'`/`active: true`) do restante
 * da lógica de `Service`, mesma disciplina de responsabilidade única já exigida por
 * IMP-201/IMP-301/IMP-401.
 */
export interface CreateBillOfMaterialsInput {
  readonly tenantId: string;
  readonly outputProductId: string;
  readonly lines: readonly BOMLine[];
  /** Versão explícita — usada por `BillOfMaterialsService.supersede` para encadear a versão
   * seguinte; `CreateBillOfMaterials` (primeira versão) sempre omite, assumindo `1`. */
  readonly version?: number;
}

export interface CreateProductionOrderInput {
  readonly tenantId: string;
  readonly billOfMaterialsId: string;
  readonly plannedOutputQuantity: number;
  readonly workCenterId?: string;
  readonly orderId?: string;
}

export interface RegisterProductionConsumptionInput {
  readonly inputProductId: string;
  readonly quantityConsumed: number;
  readonly acquisitionCost: number;
  readonly consumedAt?: Date;
}

export interface RegisterProductionOutputInput {
  readonly outputProductId: string;
  readonly quantityGenerated: number;
  readonly generatedAt?: Date;
}

export interface CreateWorkCenterInput {
  readonly tenantId: string;
  readonly name: string;
  readonly nominalCapacity?: number;
}

export class ProductionFactory {
  createBillOfMaterials(input: CreateBillOfMaterialsInput): BillOfMaterials {
    return {
      billOfMaterialsId: crypto.randomUUID(),
      tenantId: input.tenantId,
      outputProductId: input.outputProductId,
      version: input.version ?? 1,
      lines: input.lines,
      status: 'Active',
      createdAt: new Date(),
    };
  }

  createProductionOrder(input: CreateProductionOrderInput): ProductionOrder {
    const now = new Date();

    return {
      productionOrderId: crypto.randomUUID(),
      tenantId: input.tenantId,
      billOfMaterialsId: input.billOfMaterialsId,
      plannedOutputQuantity: input.plannedOutputQuantity,
      status: 'Planned',
      workCenterId: input.workCenterId,
      orderId: input.orderId,
      consumptions: [],
      outputs: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  createProductionConsumption(
    productionOrderId: string,
    input: RegisterProductionConsumptionInput,
  ): ProductionConsumption {
    return {
      consumptionId: crypto.randomUUID(),
      productionOrderId,
      inputProductId: input.inputProductId,
      quantityConsumed: input.quantityConsumed,
      acquisitionCost: input.acquisitionCost,
      consumedAt: input.consumedAt ?? new Date(),
    };
  }

  createProductionOutput(productionOrderId: string, input: RegisterProductionOutputInput): ProductionOutput {
    return {
      outputId: crypto.randomUUID(),
      productionOrderId,
      outputProductId: input.outputProductId,
      quantityGenerated: input.quantityGenerated,
      generatedAt: input.generatedAt ?? new Date(),
    };
  }

  createWorkCenter(input: CreateWorkCenterInput): WorkCenter {
    return {
      workCenterId: crypto.randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      nominalCapacity: input.nominalCapacity,
      active: true,
      createdAt: new Date(),
    };
  }
}
