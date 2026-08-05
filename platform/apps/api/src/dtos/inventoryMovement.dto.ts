/**
 * DTOs da camada HTTP para Inventory Movement Hub — nunca `StockMovement`/`StockPosition`/
 * `StockReservation`/`StockLocation`/`StockAlertRule` de `@abp/inventory-movement-hub` usados
 * diretamente, mesma disciplina já aplicada a `purchase.dto.ts`/`supplier.dto.ts`.
 *
 * `StockLocationAddress` (`{ line: string }`, Core) permanece um objeto aninhado (`StockLocationAddressDto`)
 * — único campo, mas ainda assim um Value Object com identidade estrutural própria (não um primitivo
 * disfarçado como `TaxId`); mesma exceção deliberada já usada para `Money` em `purchase.dto.ts`.
 *
 * Nenhum DTO de atualização parcial (`PATCH`) existe neste arquivo — auditoria desta Sprint (Passo 1)
 * confirmou que nenhum dos sete Commands do Inventory Movement Hub corresponde a uma atualização
 * parcial por merge; ver `routes/inventoryMovement.ts` para o detalhamento completo.
 */

export type MovementOriginDto = "Purchase" | "ProductionConsumption" | "ProductionOutput" | "SaleFulfillment" | "SaleReturn" | "ManualAdjustment";

export interface StockLocationAddressDto {
  readonly line: string;
}

// ---- Stock Movement ----

export interface RegisterStockMovementRequestDto {
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantityDelta: number;
  readonly origin: MovementOriginDto;
  readonly originReferenceId?: string;
  readonly occurredAt?: string;
}

export interface StockMovementResponseDto {
  readonly movementId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantityDelta: number;
  readonly origin: MovementOriginDto;
  readonly originReferenceId?: string;
  readonly occurredAt: string;
}

// ---- Stock Position ----

export interface StockPositionResponseDto {
  readonly productId: string;
  readonly locationId?: string;
  readonly quantityOnHand: number;
  readonly quantityReserved: number;
  readonly quantityAvailable: number;
  readonly recalculatedAt: string;
}

/** Resultado composto — reflete `RegisterStockMovementResult` (Core): o Movement recém-registrado e a
 * Position já recalculada, no mesmo corpo de resposta, mesmo formato de `RegisterReceivingResponseDto`
 * (Purchase Hub). */
export interface RegisterStockMovementResponseDto {
  readonly movement: StockMovementResponseDto;
  readonly position: StockPositionResponseDto;
}

// ---- Stock Reservation ----

export interface CreateStockReservationRequestDto {
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantity: number;
  readonly orderId: string;
  readonly expiresAt?: string;
}

export interface StockReservationResponseDto {
  readonly reservationId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantity: number;
  readonly orderId: string;
  readonly status: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Resultado composto de `convertReservationToMovement` — a Reservation já convertida, o novo Stock
 * Movement de saída, e a Position já recalculada, no mesmo corpo de resposta. */
export interface ConvertReservationToMovementResponseDto {
  readonly reservation: StockReservationResponseDto;
  readonly movement: StockMovementResponseDto;
  readonly position: StockPositionResponseDto;
}

// ---- Stock Location ----

export interface CreateStockLocationRequestDto {
  readonly tenantId: string;
  readonly name: string;
  readonly address?: StockLocationAddressDto;
}

export interface StockLocationResponseDto {
  readonly locationId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly address?: StockLocationAddressDto;
  readonly active: boolean;
  readonly createdAt: string;
}

// ---- Stock Alert Rule ----

export interface CreateStockAlertRuleRequestDto {
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly thresholdQuantity: number;
}

export interface StockAlertRuleResponseDto {
  readonly ruleId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly thresholdQuantity: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
