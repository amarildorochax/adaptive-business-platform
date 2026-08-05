/**
 * DTOs do contrato HTTP do Inventory Movement Hub — espelham exatamente
 * `apps/api/src/dtos/inventoryMovement.dto.ts` (IMP-403). Cópia deliberada, nunca um import cruzado
 * entre `apps/web` e `apps/api` (mesma disciplina de `purchase.dto.ts`/`supplier.dto.ts`) — cada
 * camada permanece independente, per instrução explícita de IMP-404 ("Nunca compartilhar DTOs entre
 * Backend e Frontend").
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
