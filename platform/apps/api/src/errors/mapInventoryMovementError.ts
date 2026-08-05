import { InventoryDomainError } from "@abp/inventory-movement-hub";
import { ConflictError, HttpError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

/**
 * Tradução de erro específica das rotas `/stock-movements*`/`/stock-positions*`/`/stock-reservations*`/
 * `/stock-locations*`/`/stock-alert-rules*` — mesmo mecanismo já adotado por `mapPurchaseError.ts`/
 * `mapSupplierError.ts`: uma função de domínio específica que delega a `mapDomainError` (FUN-004)
 * como fallback, nunca um sistema paralelo. `mapDomainError.ts` permanece inteiramente intocado, per
 * instrução explícita.
 *
 * `InventoryMovementManager` (Core, IMP-401) lança `InventoryDomainError` — mesma disciplina de
 * hierarquia tipada já adotada por `PurchaseDomainError`/`SupplierDomainError`, mapeada aqui por
 * `instanceof`/`code`, nunca por heurística de texto.
 *
 * Auditoria desta Sprint (Passo 1) não encontrou nenhuma mensagem de `InventoryDomainError` fora do
 * alcance da heurística de `mapDomainError` — `mapDomainError` só é alcançado para um erro
 * genuinamente fora de `InventoryDomainError` (ver último `return` abaixo).
 */
export function mapInventoryMovementError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof InventoryDomainError) {
    switch (error.code) {
      case "STOCK_RESERVATION_NOT_FOUND":
      case "STOCK_ALERT_RULE_NOT_FOUND":
        return new NotFoundError(error.message);
      case "STOCK_RESERVATION_INVALID_STATUS_TRANSITION":
        return new ConflictError(error.message);
      case "INVENTORY_INVALID_QUANTITY_DELTA":
      case "INVENTORY_MOVEMENT_ORIGIN_REFERENCE_REQUIRED":
      case "STOCK_RESERVATION_EXCEEDS_AVAILABLE":
      case "INVENTORY_INVALID_STOCK_LOCATION":
        return new UnprocessableEntityError(error.message);
      default:
        return mapDomainError(error);
    }
  }

  return mapDomainError(error);
}
