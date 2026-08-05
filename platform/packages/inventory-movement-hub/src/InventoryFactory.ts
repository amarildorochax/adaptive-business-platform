import type { MovementOrigin } from './MovementOrigin';
import type { QuantityDelta } from './QuantityDelta';
import type { StockAlertRule } from './StockAlertRule';
import type { StockLocation, StockLocationAddress } from './StockLocation';
import type { StockMovement } from './StockMovement';
import type { StockReservation } from './StockReservation';

/**
 * InventoryFactory — construção de cada Entidade do Inventory Movement Hub, isolando geração de
 * identificador e atribuição de padrão (`status: 'Active'` para toda nova Reservation, `active: true`
 * para toda nova Location/Alert Rule) do restante da lógica de `Service`, mesma disciplina de
 * responsabilidade única já exigida por IMP-201/IMP-301.
 */
export interface CreateStockMovementInput {
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantityDelta: QuantityDelta;
  readonly origin: MovementOrigin;
  readonly originReferenceId?: string;
  readonly occurredAt?: Date;
}

export interface CreateStockReservationInput {
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantity: number;
  readonly orderId: string;
  readonly expiresAt?: Date;
}

export interface CreateStockLocationInput {
  readonly tenantId: string;
  readonly name: string;
  readonly address?: StockLocationAddress;
}

export interface CreateStockAlertRuleInput {
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly thresholdQuantity: number;
}

export class InventoryFactory {
  createStockMovement(input: CreateStockMovementInput): StockMovement {
    return {
      movementId: crypto.randomUUID(),
      tenantId: input.tenantId,
      productId: input.productId,
      variantId: input.variantId,
      locationId: input.locationId,
      quantityDelta: input.quantityDelta,
      origin: input.origin,
      originReferenceId: input.originReferenceId,
      occurredAt: input.occurredAt ?? new Date(),
    };
  }

  createStockReservation(input: CreateStockReservationInput): StockReservation {
    const now = new Date();

    return {
      reservationId: crypto.randomUUID(),
      tenantId: input.tenantId,
      productId: input.productId,
      variantId: input.variantId,
      locationId: input.locationId,
      quantity: input.quantity,
      orderId: input.orderId,
      status: 'Active',
      expiresAt: input.expiresAt,
      createdAt: now,
      updatedAt: now,
    };
  }

  createStockLocation(input: CreateStockLocationInput): StockLocation {
    return {
      locationId: crypto.randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      address: input.address,
      active: true,
      createdAt: new Date(),
    };
  }

  createStockAlertRule(input: CreateStockAlertRuleInput): StockAlertRule {
    const now = new Date();

    return {
      ruleId: crypto.randomUUID(),
      tenantId: input.tenantId,
      productId: input.productId,
      variantId: input.variantId,
      locationId: input.locationId,
      thresholdQuantity: input.thresholdQuantity,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
  }
}
