/**
 * Query Keys do Purchase Hub — mesma disciplina de centralização de `supplierQueryKeys.ts`
 * (IMP-204). Seis chaves, uma por Query exposta em `apps/api/src/routes/purchase.ts` (IMP-303) —
 * nenhuma para `ReorderRule` (nenhuma Query de detalhe/listagem existe em `PurchaseManager` para
 * este Aggregate — apenas `createReorderRule`/`deactivateReorderRule`/`evaluateReorderRule`, todos
 * Mutations, ver `purchaseClient.ts`).
 */
export const purchaseQueryKeys = {
  order: (purchaseOrderId: string) => ["purchase", "order", purchaseOrderId] as const,
  openOrdersByTenant: (tenantId: string) => ["purchase", "orders", "open", tenantId] as const,
  ordersBySupplier: (supplierId: string) => ["purchase", "orders", "by-supplier", supplierId] as const,
  receivings: (purchaseOrderId: string) => ["purchase", "receivings", purchaseOrderId] as const,
  requisition: (requisitionId: string) => ["purchase", "requisition", requisitionId] as const,
  requisitionsByStatus: (tenantId: string, status: string) => ["purchase", "requisitions", tenantId, status] as const,
};
