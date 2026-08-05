/**
 * DTOs da camada HTTP para Production Hub — nunca `BillOfMaterials`/`ProductionOrder`/`WorkCenter`/
 * etc. de `@abp/production-hub` usados diretamente, mesma disciplina já aplicada a
 * `inventoryMovement.dto.ts`/`purchase.dto.ts`/`supplier.dto.ts`.
 *
 * Nenhum DTO de atualização parcial (`PATCH`) existe neste arquivo — auditoria desta Sprint (Passo 1)
 * confirmou que nenhum dos nove Commands do Production Hub corresponde a uma atualização parcial por
 * merge; ver `routes/production.ts` para o detalhamento completo.
 *
 * `availableQuantities` (`StartProductionRequestDto`) é um `Record<string, number>` — tradução HTTP de
 * `ReadonlyMap<string, number>` (Core), já que JSON não possui um tipo Map nativo; convertido de volta
 * a `Map` apenas dentro do handler de rota (`routes/production.ts`), nunca lógica de negócio.
 */

export type UnitOfMeasureDto = "Unit" | "Kilogram" | "Liter" | "Meter";
export type BillOfMaterialsStatusDto = "Active" | "Superseded";
export type ProductionStatusDto = "Planned" | "InProgress" | "Completed" | "Cancelled";

export interface BOMLineDto {
  readonly inputProductId: string;
  readonly variantId?: string;
  readonly quantityPerOutputUnit: number;
  readonly unitOfMeasure: UnitOfMeasureDto;
}

// ---- Bill of Materials ----

export interface CreateBillOfMaterialsRequestDto {
  readonly tenantId: string;
  readonly outputProductId: string;
  readonly lines: readonly BOMLineDto[];
}

export interface SupersedeBillOfMaterialsRequestDto {
  readonly lines: readonly BOMLineDto[];
}

export interface BillOfMaterialsResponseDto {
  readonly billOfMaterialsId: string;
  readonly tenantId: string;
  readonly outputProductId: string;
  readonly version: number;
  readonly lines: readonly BOMLineDto[];
  readonly status: BillOfMaterialsStatusDto;
  readonly createdAt: string;
  readonly supersededAt?: string;
}

/** Resultado composto de `supersedeBillOfMaterials` — reflete `SupersedeBillOfMaterialsResult` (Core):
 * a versão recém-superada e a nova versão já ativa, no mesmo corpo de resposta, mesmo formato de
 * `ConvertReservationToMovementResponseDto` (Inventory Movement Hub). */
export interface SupersedeBillOfMaterialsResponseDto {
  readonly previous: BillOfMaterialsResponseDto;
  readonly next: BillOfMaterialsResponseDto;
}

// ---- Production Order ----

export interface CreateProductionOrderRequestDto {
  readonly tenantId: string;
  readonly billOfMaterialsId: string;
  readonly plannedOutputQuantity: number;
  readonly workCenterId?: string;
  readonly orderId?: string;
}

export interface ProductionConsumptionResponseDto {
  readonly consumptionId: string;
  readonly productionOrderId: string;
  readonly inputProductId: string;
  readonly quantityConsumed: number;
  readonly acquisitionCost: number;
  readonly consumedAt: string;
}

export interface ProductionOutputResponseDto {
  readonly outputId: string;
  readonly productionOrderId: string;
  readonly outputProductId: string;
  readonly quantityGenerated: number;
  readonly generatedAt: string;
}

export interface ProductionOrderResponseDto {
  readonly productionOrderId: string;
  readonly tenantId: string;
  readonly billOfMaterialsId: string;
  readonly plannedOutputQuantity: number;
  readonly status: ProductionStatusDto;
  readonly workCenterId?: string;
  readonly orderId?: string;
  readonly consumptions: readonly ProductionConsumptionResponseDto[];
  readonly outputs: readonly ProductionOutputResponseDto[];
  readonly cancelReason?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StartProductionRequestDto {
  readonly availableQuantities: Record<string, number>;
}

/** Resultado composto de `startProduction` — reflete `StartProductionResult` (Core): a ProductionOrder
 * (transicionada ou não) e o indicador explícito `started`, nunca inferido pelo cliente a partir do
 * `status` sozinho (insumo insuficiente é um resultado de negócio válido, nunca um erro HTTP). */
export interface StartProductionResponseDto {
  readonly productionOrder: ProductionOrderResponseDto;
  readonly started: boolean;
}

export interface RegisterProductionConsumptionRequestDto {
  readonly inputProductId: string;
  readonly quantityConsumed: number;
  readonly acquisitionCost: number;
  readonly consumedAt?: string;
}

/** Resultado composto de `registerProductionConsumption` — a ProductionOrder já atualizada e o
 * registro de consumo recém-criado, mesmo formato de `RegisterStockMovementResponseDto`. */
export interface RegisterProductionConsumptionResponseDto {
  readonly productionOrder: ProductionOrderResponseDto;
  readonly consumption: ProductionConsumptionResponseDto;
}

export interface RegisterProductionOutputRequestDto {
  readonly outputProductId: string;
  readonly quantityGenerated: number;
  readonly generatedAt?: string;
}

export interface RegisterProductionOutputResponseDto {
  readonly productionOrder: ProductionOrderResponseDto;
  readonly output: ProductionOutputResponseDto;
}

export interface CancelProductionRequestDto {
  readonly reason: string;
}

export interface TotalConsumedCostResponseDto {
  readonly totalConsumedCost: number;
}

export interface TotalGeneratedQuantityResponseDto {
  readonly totalGeneratedQuantity: number;
}

// ---- Work Center ----

export interface CreateWorkCenterRequestDto {
  readonly tenantId: string;
  readonly name: string;
  readonly nominalCapacity?: number;
}

export interface WorkCenterResponseDto {
  readonly workCenterId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly nominalCapacity?: number;
  readonly active: boolean;
  readonly createdAt: string;
}
