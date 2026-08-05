/**
 * Query Keys do Inventory Movement Hub — mesma disciplina de centralização de
 * `purchaseQueryKeys.ts`/`supplierQueryKeys.ts`. Seis chaves, uma por Query exposta em
 * `apps/api/src/routes/inventoryMovement.ts` (IMP-403) — nenhuma para `StockAlertRule`: nenhuma Query
 * de detalhe/listagem existe em `InventoryMovementManager` para este Aggregate (apenas
 * `createStockAlertRule`/`deactivateStockAlertRule`, ambos Mutations) — mesmo formato exato já
 * documentado para `ReorderRule` em `purchaseQueryKeys.ts` (Purchase Hub).
 *
 * `locationId` entra na chave como `locationId ?? null` — nunca omitido quando `undefined` — para que
 * `useStockPosition(productId, undefined)` e `useStockPosition(productId, "location-a")` produzam
 * chaves distintas e nunca colidam no cache.
 */
export const inventoryMovementQueryKeys = {
  movementsByProduct: (productId: string, locationId?: string) => ["inventory-movement", "movements", "by-product", productId, locationId ?? null] as const,
  movementsByOriginReference: (originReferenceId: string) => ["inventory-movement", "movements", "by-origin-reference", originReferenceId] as const,
  position: (productId: string, locationId?: string) => ["inventory-movement", "position", productId, locationId ?? null] as const,
  reservation: (reservationId: string) => ["inventory-movement", "reservation", reservationId] as const,
  reservationsByOrder: (orderId: string) => ["inventory-movement", "reservations", "by-order", orderId] as const,
  activeLocationsByTenant: (tenantId: string) => ["inventory-movement", "locations", "active", tenantId] as const,
};
