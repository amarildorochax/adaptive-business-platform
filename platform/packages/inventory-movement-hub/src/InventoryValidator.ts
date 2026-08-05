import {
  InvalidQuantityDeltaError,
  InvalidStockLocationError,
  MovementOriginReferenceRequiredError,
  StockReservationExceedsAvailableError,
  StockReservationInvalidStatusTransitionError,
} from './InventoryDomainError';
import { requiresOriginReference, type MovementOrigin } from './MovementOrigin';
import { isValidQuantityDelta, type QuantityDelta } from './QuantityDelta';
import { canTransitionReservationStatus } from './InventoryPolicy';
import type { StockReservationStatus } from './StockReservation';

/**
 * InventoryValidator — a implementação real das validações de domínio do Inventory Movement Hub,
 * mesma disciplina de `PurchaseValidator`/`SupplierValidator`: lança `InventoryDomainError` de fato,
 * nunca apenas um catálogo declarativo de regras adiado para um "Validation Engine" futuro. Consulta
 * `InventoryPolicy` (pura) antes de decidir se lança.
 */
export class InventoryValidator {
  /** Validação de `QuantityDelta`. */
  ensureValidQuantityDelta(quantityDelta: QuantityDelta): void {
    if (!isValidQuantityDelta(quantityDelta)) {
      throw new InvalidQuantityDeltaError();
    }
  }

  /**
   * `ProductionConsumption`/`ProductionOutput` sempre exigem `originReferenceId` — "nunca criado sem
   * correlação rastreável" (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11).
   */
  ensureOriginReferenceProvidedWhenRequired(origin: MovementOrigin, originReferenceId: string | undefined): void {
    if (requiresOriginReference(origin) && !originReferenceId) {
      throw new MovementOriginReferenceRequiredError(origin);
    }
  }

  /** "Status" — a transição de status de Stock Reservation solicitada é legítima. */
  ensureReservationStatusTransitionAllowed(from: StockReservationStatus, to: StockReservationStatus): void {
    if (!canTransitionReservationStatus(from, to)) {
      throw new StockReservationInvalidStatusTransitionError(from, to);
    }
  }

  /**
   * `Stock Position.quantityAvailable` nunca é negativo por desenho — uma tentativa de
   * `Stock Reservation` acima da quantidade disponível é rejeitada, nunca aceita com saldo negativo
   * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11).
   */
  ensureReservationWithinAvailable(productId: string, quantityAvailable: number, requestedQuantity: number): void {
    if (requestedQuantity > quantityAvailable) {
      throw new StockReservationExceedsAvailableError(productId);
    }
  }

  /** O nome de uma `StockLocation` é obrigatório e não pode ser vazio. */
  ensureValidStockLocationName(name: string): void {
    if (name.trim().length === 0) {
      throw new InvalidStockLocationError();
    }
  }
}
