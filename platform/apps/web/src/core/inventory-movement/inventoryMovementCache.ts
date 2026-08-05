import type { QueryClient } from "@tanstack/react-query";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";
import type { StockLocationResponseDto, StockMovementResponseDto, StockPositionResponseDto, StockReservationResponseDto } from "./inventoryMovement.dto.js";

/**
 * Helpers de sincronização de cache do Inventory Movement Hub — mesmo padrão de
 * `syncPurchaseOrderInCaches`/`syncSupplierInCaches`: grava o cache de detalhe/projeção diretamente
 * (`setQueryData`), e, quando uma lista já cacheada existir, substitui a entrada correspondente ou a
 * acrescenta. Nenhum `invalidateQueries` — o dado já devolvido pela própria Mutation já é o estado
 * real pós-operação. Nenhuma estratégia nova inventada, per instrução explícita de IMP-404 ("Seguir
 * rigorosamente a estratégia já consolidada. Não criar novas estratégias.").
 *
 * PRINCÍPIO DO LEDGER: `appendStockMovementInCache` é sempre aditivo — nunca substitui uma entrada já
 * existente, porque um `StockMovement` nunca é alterado após criado (Core/Persistência/HTTP,
 * IMP-401/402/403). Mesmo formato de `appendReceivingInCache` (Purchase Hub) para `Receiving`, outra
 * Entidade imutável após criação — mas aqui a disciplina não é apenas convenção, é a própria natureza
 * do domínio: não existe nenhum cenário em que um Movement já cacheado precise ser "substituído".
 */
export function appendStockMovementInCache(queryClient: QueryClient, movement: StockMovementResponseDto): void {
  queryClient.setQueryData<readonly StockMovementResponseDto[]>(
    inventoryMovementQueryKeys.movementsByProduct(movement.productId, movement.locationId),
    (previous) => (previous ? [...previous, movement] : previous),
  );

  if (movement.originReferenceId) {
    queryClient.setQueryData<readonly StockMovementResponseDto[]>(
      inventoryMovementQueryKeys.movementsByOriginReference(movement.originReferenceId),
      (previous) => (previous ? [...previous, movement] : previous),
    );
  }
}

/** `StockPosition` é sempre a projeção mais recente — nunca uma lista, sempre uma substituição direta (nunca aditiva). */
export function syncStockPositionInCache(queryClient: QueryClient, position: StockPositionResponseDto): void {
  queryClient.setQueryData<StockPositionResponseDto>(inventoryMovementQueryKeys.position(position.productId, position.locationId), position);
}

/**
 * `StockReservation` é uma Entidade mutável (`Active → Released | ConvertedToMovement`) — diferente de
 * `StockMovement`, uma transição real precisa substituir a entrada já cacheada, nunca apenas
 * acrescentar uma segunda. Mesma disciplina de `replaceOrAppend` já usada por `syncSupplierInCaches`/
 * `syncPurchaseOrderInCaches`.
 */
export function syncStockReservationInCaches(queryClient: QueryClient, reservation: StockReservationResponseDto): void {
  queryClient.setQueryData<StockReservationResponseDto>(inventoryMovementQueryKeys.reservation(reservation.reservationId), reservation);

  queryClient.setQueryData<readonly StockReservationResponseDto[]>(
    inventoryMovementQueryKeys.reservationsByOrder(reservation.orderId),
    (previous) => {
      if (!previous) {
        return previous;
      }

      const exists = previous.some((existing) => existing.reservationId === reservation.reservationId);
      return exists
        ? previous.map((existing) => (existing.reservationId === reservation.reservationId ? reservation : existing))
        : [...previous, reservation];
    },
  );
}

/** Acrescenta uma nova Stock Location à lista de ativas já cacheada do mesmo Tenant — sempre aditiva (toda nova Location nasce `active: true`, per `InventoryFactory.createStockLocation`, Core), mesmo formato de `appendReceivingInCache`. */
export function appendStockLocationInCache(queryClient: QueryClient, location: StockLocationResponseDto): void {
  queryClient.setQueryData<readonly StockLocationResponseDto[]>(
    inventoryMovementQueryKeys.activeLocationsByTenant(location.tenantId),
    (previous) => (previous ? [...previous, location] : previous),
  );
}
