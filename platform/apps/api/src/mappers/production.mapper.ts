import type {
  BillOfMaterials,
  BOMLine,
  ProductionConsumption,
  ProductionOrder,
  ProductionOutput,
  RegisterProductionConsumptionResult,
  RegisterProductionOutputResult,
  StartProductionResult,
  SupersedeBillOfMaterialsResult,
  WorkCenter,
} from "@abp/production-hub";
import type {
  BillOfMaterialsResponseDto,
  BOMLineDto,
  ProductionConsumptionResponseDto,
  ProductionOrderResponseDto,
  ProductionOutputResponseDto,
  RegisterProductionConsumptionResponseDto,
  RegisterProductionOutputResponseDto,
  StartProductionResponseDto,
  SupersedeBillOfMaterialsResponseDto,
  WorkCenterResponseDto,
} from "../dtos/production.dto.js";

function toBOMLineDto(line: BOMLine): BOMLineDto {
  return {
    inputProductId: line.inputProductId,
    variantId: line.variantId,
    quantityPerOutputUnit: line.quantityPerOutputUnit,
    unitOfMeasure: line.unitOfMeasure,
  };
}

export function toBillOfMaterialsResponseDto(bom: BillOfMaterials): BillOfMaterialsResponseDto {
  return {
    billOfMaterialsId: bom.billOfMaterialsId,
    tenantId: bom.tenantId,
    outputProductId: bom.outputProductId,
    version: bom.version,
    lines: bom.lines.map(toBOMLineDto),
    status: bom.status,
    createdAt: bom.createdAt.toISOString(),
    supersededAt: bom.supersededAt?.toISOString(),
  };
}

export function toSupersedeBillOfMaterialsResponseDto(result: SupersedeBillOfMaterialsResult): SupersedeBillOfMaterialsResponseDto {
  return {
    previous: toBillOfMaterialsResponseDto(result.previous),
    next: toBillOfMaterialsResponseDto(result.next),
  };
}

function toProductionConsumptionResponseDto(consumption: ProductionConsumption): ProductionConsumptionResponseDto {
  return {
    consumptionId: consumption.consumptionId,
    productionOrderId: consumption.productionOrderId,
    inputProductId: consumption.inputProductId,
    quantityConsumed: consumption.quantityConsumed,
    acquisitionCost: consumption.acquisitionCost,
    consumedAt: consumption.consumedAt.toISOString(),
  };
}

function toProductionOutputResponseDto(output: ProductionOutput): ProductionOutputResponseDto {
  return {
    outputId: output.outputId,
    productionOrderId: output.productionOrderId,
    outputProductId: output.outputProductId,
    quantityGenerated: output.quantityGenerated,
    generatedAt: output.generatedAt.toISOString(),
  };
}

export function toProductionOrderResponseDto(order: ProductionOrder): ProductionOrderResponseDto {
  return {
    productionOrderId: order.productionOrderId,
    tenantId: order.tenantId,
    billOfMaterialsId: order.billOfMaterialsId,
    plannedOutputQuantity: order.plannedOutputQuantity,
    status: order.status,
    workCenterId: order.workCenterId,
    orderId: order.orderId,
    consumptions: order.consumptions.map(toProductionConsumptionResponseDto),
    outputs: order.outputs.map(toProductionOutputResponseDto),
    cancelReason: order.cancelReason,
    startedAt: order.startedAt?.toISOString(),
    completedAt: order.completedAt?.toISOString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function toStartProductionResponseDto(result: StartProductionResult): StartProductionResponseDto {
  return {
    productionOrder: toProductionOrderResponseDto(result.productionOrder),
    started: result.started,
  };
}

export function toRegisterProductionConsumptionResponseDto(
  result: RegisterProductionConsumptionResult,
): RegisterProductionConsumptionResponseDto {
  return {
    productionOrder: toProductionOrderResponseDto(result.productionOrder),
    consumption: toProductionConsumptionResponseDto(result.consumption),
  };
}

export function toRegisterProductionOutputResponseDto(result: RegisterProductionOutputResult): RegisterProductionOutputResponseDto {
  return {
    productionOrder: toProductionOrderResponseDto(result.productionOrder),
    output: toProductionOutputResponseDto(result.output),
  };
}

export function toWorkCenterResponseDto(workCenter: WorkCenter): WorkCenterResponseDto {
  return {
    workCenterId: workCenter.workCenterId,
    tenantId: workCenter.tenantId,
    name: workCenter.name,
    nominalCapacity: workCenter.nominalCapacity,
    active: workCenter.active,
    createdAt: workCenter.createdAt.toISOString(),
  };
}
