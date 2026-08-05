import type {
  ConvertReservationToMovementResult,
  RegisterStockMovementResult,
  StockAlertRule,
  StockLocation,
  StockMovement,
  StockPosition,
  StockReservation,
} from "@abp/inventory-movement-hub";
import type {
  ConvertReservationToMovementResponseDto,
  RegisterStockMovementResponseDto,
  StockAlertRuleResponseDto,
  StockLocationResponseDto,
  StockMovementResponseDto,
  StockPositionResponseDto,
  StockReservationResponseDto,
} from "../dtos/inventoryMovement.dto.js";

export function toStockMovementResponseDto(movement: StockMovement): StockMovementResponseDto {
  return {
    movementId: movement.movementId,
    tenantId: movement.tenantId,
    productId: movement.productId,
    variantId: movement.variantId,
    locationId: movement.locationId,
    quantityDelta: movement.quantityDelta,
    origin: movement.origin,
    originReferenceId: movement.originReferenceId,
    occurredAt: movement.occurredAt.toISOString(),
  };
}

export function toStockPositionResponseDto(position: StockPosition): StockPositionResponseDto {
  return {
    productId: position.productId,
    locationId: position.locationId,
    quantityOnHand: position.quantityOnHand,
    quantityReserved: position.quantityReserved,
    quantityAvailable: position.quantityAvailable,
    recalculatedAt: position.recalculatedAt.toISOString(),
  };
}

export function toRegisterStockMovementResponseDto(result: RegisterStockMovementResult): RegisterStockMovementResponseDto {
  return {
    movement: toStockMovementResponseDto(result.movement),
    position: toStockPositionResponseDto(result.position),
  };
}

export function toStockReservationResponseDto(reservation: StockReservation): StockReservationResponseDto {
  return {
    reservationId: reservation.reservationId,
    tenantId: reservation.tenantId,
    productId: reservation.productId,
    variantId: reservation.variantId,
    locationId: reservation.locationId,
    quantity: reservation.quantity,
    orderId: reservation.orderId,
    status: reservation.status,
    expiresAt: reservation.expiresAt?.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

export function toConvertReservationToMovementResponseDto(
  conversion: ConvertReservationToMovementResult,
): ConvertReservationToMovementResponseDto {
  return {
    reservation: toStockReservationResponseDto(conversion.reservation),
    movement: toStockMovementResponseDto(conversion.movement),
    position: toStockPositionResponseDto(conversion.position),
  };
}

export function toStockLocationResponseDto(location: StockLocation): StockLocationResponseDto {
  return {
    locationId: location.locationId,
    tenantId: location.tenantId,
    name: location.name,
    address: location.address,
    active: location.active,
    createdAt: location.createdAt.toISOString(),
  };
}

export function toStockAlertRuleResponseDto(rule: StockAlertRule): StockAlertRuleResponseDto {
  return {
    ruleId: rule.ruleId,
    tenantId: rule.tenantId,
    productId: rule.productId,
    variantId: rule.variantId,
    locationId: rule.locationId,
    thresholdQuantity: rule.thresholdQuantity,
    active: rule.active,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}
