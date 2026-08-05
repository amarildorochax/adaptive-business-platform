import { apiClient } from "../http/client.js";
import { undefinedOn404 } from "../http/undefinedOn404.js";
import type {
  ConvertReservationToMovementResponseDto,
  CreateStockAlertRuleRequestDto,
  CreateStockLocationRequestDto,
  CreateStockReservationRequestDto,
  RegisterStockMovementRequestDto,
  RegisterStockMovementResponseDto,
  StockAlertRuleResponseDto,
  StockLocationResponseDto,
  StockMovementResponseDto,
  StockPositionResponseDto,
  StockReservationResponseDto,
} from "./inventoryMovement.dto.js";

/** Anexa `?locationId=` apenas quando informado — nenhum endpoint desta API trata `locationId=""` como equivalente a "ausente". */
function withLocationQuery(path: string, locationId: string | undefined): string {
  return locationId === undefined ? path : `${path}?locationId=${encodeURIComponent(locationId)}`;
}

/**
 * Cliente HTTP do Inventory Movement Hub — espelha `apps/api/src/routes/inventoryMovement.ts`
 * (IMP-403), rota a rota, mesma disciplina de `purchaseClient.ts`/`supplierClient.ts`. Treze métodos,
 * um por endpoint — nenhum acessa `InventoryMovementManager` diretamente, toda comunicação passa
 * exclusivamente por `apiClient` (`core/http/client.ts`), a mesma instância única já usada por toda a
 * aplicação.
 *
 * PRINCÍPIO DO LEDGER: nenhum método `updateStockMovement`/`deleteStockMovement`/`replaceStockMovement`
 * existe aqui, nem poderia existir — `apps/api/src/routes/inventoryMovement.ts` não registra nenhuma
 * rota `PUT`/`PATCH`/`DELETE` para `/stock-movements*` (IMP-403, Seção 10, garantia verificada em
 * quatro camadas independentes). Este cliente reflete exatamente a superfície real da API — não uma
 * omissão deliberada de algo que poderia ser chamado, mas a ausência exata do que não existe.
 */
export const inventoryMovementClient = {
  // ---- Stock Movement ----

  registerStockMovement(payload: RegisterStockMovementRequestDto): Promise<RegisterStockMovementResponseDto> {
    return apiClient.post("/stock-movements", payload);
  },

  listStockMovementsByProduct(productId: string, locationId?: string): Promise<readonly StockMovementResponseDto[]> {
    return apiClient.get(withLocationQuery(`/stock-movements/by-product/${encodeURIComponent(productId)}`, locationId));
  },

  listStockMovementsByOriginReference(originReferenceId: string): Promise<readonly StockMovementResponseDto[]> {
    return apiClient.get(`/stock-movements/by-origin-reference/${encodeURIComponent(originReferenceId)}`);
  },

  // ---- Stock Position ----

  findStockPosition(productId: string, locationId?: string): Promise<StockPositionResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(withLocationQuery(`/stock-positions/${encodeURIComponent(productId)}`, locationId)));
  },

  // ---- Stock Reservation ----

  createStockReservation(payload: CreateStockReservationRequestDto): Promise<StockReservationResponseDto> {
    return apiClient.post("/stock-reservations", payload);
  },

  findStockReservationById(reservationId: string): Promise<StockReservationResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/stock-reservations/${encodeURIComponent(reservationId)}`));
  },

  listStockReservationsByOrder(orderId: string): Promise<readonly StockReservationResponseDto[]> {
    return apiClient.get(`/stock-reservations/by-order/${encodeURIComponent(orderId)}`);
  },

  releaseStockReservation(reservationId: string): Promise<StockReservationResponseDto> {
    return apiClient.post(`/stock-reservations/${encodeURIComponent(reservationId)}/release`);
  },

  convertReservationToMovement(reservationId: string): Promise<ConvertReservationToMovementResponseDto> {
    return apiClient.post(`/stock-reservations/${encodeURIComponent(reservationId)}/convert`);
  },

  // ---- Stock Location ----

  createStockLocation(payload: CreateStockLocationRequestDto): Promise<StockLocationResponseDto> {
    return apiClient.post("/stock-locations", payload);
  },

  listActiveStockLocationsByTenant(tenantId: string): Promise<readonly StockLocationResponseDto[]> {
    return apiClient.get(`/stock-locations/by-tenant/${encodeURIComponent(tenantId)}/active`);
  },

  // ---- Stock Alert Rule ----

  createStockAlertRule(payload: CreateStockAlertRuleRequestDto): Promise<StockAlertRuleResponseDto> {
    return apiClient.post("/stock-alert-rules", payload);
  },

  deactivateStockAlertRule(ruleId: string): Promise<StockAlertRuleResponseDto> {
    return apiClient.post(`/stock-alert-rules/${encodeURIComponent(ruleId)}/deactivate`);
  },
};
