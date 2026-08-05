/**
 * InventoryDomainError — a taxonomia de erro de domínio do Inventory Movement Hub, distinta de
 * `PlatformError` (`@abp/shared`) e nunca reutilizando `PurchaseDomainError`/`SupplierDomainError`,
 * per instrução explícita de IMP-401 ("Criar Domain Errors específicos. Nunca reutilizar Errors de
 * outros Hubs"). Cada classe aqui representa a violação de uma regra específica já registrada em
 * `INVENTORY_MOVEMENT_HUB.md`, Capítulo 11 ("Regras de Negócio"), nunca uma condição técnica genérica.
 */

export abstract class InventoryDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** O `QuantityDelta` informado é inválido (zero, não inteiro, ou não finito). */
export class InvalidQuantityDeltaError extends InventoryDomainError {
  readonly code = 'INVENTORY_INVALID_QUANTITY_DELTA';

  constructor() {
    super('Quantidade de movimentação inválida — deve ser um inteiro diferente de zero.');
  }
}

/**
 * `RegisterStockMovement` foi chamado com origem `ProductionConsumption`/`ProductionOutput` sem
 * `originReferenceId` — regra "Todo Stock Movement de origem ProductionConsumption/ProductionOutput
 * referencia uma Production Order existente — nunca criado sem correlação rastreável"
 * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11).
 */
export class MovementOriginReferenceRequiredError extends InventoryDomainError {
  readonly code = 'INVENTORY_MOVEMENT_ORIGIN_REFERENCE_REQUIRED';

  constructor(origin: string) {
    super(`Movimentação de origem ${origin} exige originReferenceId — nunca criada sem correlação rastreável.`);
  }
}

/** Nenhuma Stock Reservation foi encontrada para o identificador informado. */
export class StockReservationNotFoundError extends InventoryDomainError {
  readonly code = 'STOCK_RESERVATION_NOT_FOUND';

  constructor(reservationId: string) {
    super(`Stock Reservation ${reservationId} não encontrada.`);
  }
}

/**
 * A transição de status solicitada não é permitida pela máquina de estados de
 * `StockReservationStatus` (`InventoryPolicy.canTransitionReservationStatus`).
 */
export class StockReservationInvalidStatusTransitionError extends InventoryDomainError {
  readonly code = 'STOCK_RESERVATION_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status de Stock Reservation inválida: ${from} → ${to}.`);
  }
}

/**
 * Uma `StockReservation` acima da `quantityAvailable` corrente é sempre rejeitada — regra
 * "Stock Position.quantityAvailable nunca é negativo por desenho" (`INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 11).
 */
export class StockReservationExceedsAvailableError extends InventoryDomainError {
  readonly code = 'STOCK_RESERVATION_EXCEEDS_AVAILABLE';

  constructor(productId: string) {
    super(`Quantidade reservada para o produto ${productId} excede a quantidade disponível em estoque.`);
  }
}

/** Nenhuma Stock Alert Rule foi encontrada para o identificador informado. */
export class StockAlertRuleNotFoundError extends InventoryDomainError {
  readonly code = 'STOCK_ALERT_RULE_NOT_FOUND';

  constructor(ruleId: string) {
    super(`Stock Alert Rule ${ruleId} não encontrada.`);
  }
}

/** O nome de uma `StockLocation` é obrigatório e não pode ser vazio. */
export class InvalidStockLocationError extends InventoryDomainError {
  readonly code = 'INVENTORY_INVALID_STOCK_LOCATION';

  constructor() {
    super('Stock Location inválida — o nome é obrigatório e não pode ser vazio.');
  }
}
