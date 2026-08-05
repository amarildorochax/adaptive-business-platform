/**
 * Query Keys do Production Hub — mesma disciplina de centralização de
 * `inventoryMovementQueryKeys.ts`/`purchaseQueryKeys.ts`/`supplierQueryKeys.ts`. Oito chaves, uma por
 * Query exposta em `apps/api/src/routes/production.ts` (IMP-503) — nenhuma para
 * `ProductionConsumption`/`ProductionOutput`: nenhuma Query de detalhe/listagem própria existe para
 * nenhum dos dois (ambos partes internas de `ProductionOrder`, sem Repository/endpoint próprio desde
 * o Core, IMP-501) — mesmo formato já documentado para `StockAlertRule`/`ReorderRule`.
 */
export const productionQueryKeys = {
  billOfMaterials: (billOfMaterialsId: string) => ["production", "bill-of-materials", billOfMaterialsId] as const,
  activeBillOfMaterialsByProduct: (outputProductId: string) =>
    ["production", "bill-of-materials", "active-by-product", outputProductId] as const,
  productionOrder: (productionOrderId: string) => ["production", "production-order", productionOrderId] as const,
  productionOrdersByStatus: (status: string) => ["production", "production-orders", "by-status", status] as const,
  productionOrdersByOrigin: (orderId: string) => ["production", "production-orders", "by-origin", orderId] as const,
  totalConsumedCost: (productionOrderId: string) => ["production", "production-order", productionOrderId, "total-consumed-cost"] as const,
  totalGeneratedQuantity: (productionOrderId: string) =>
    ["production", "production-order", productionOrderId, "total-generated-quantity"] as const,
  activeWorkCenters: () => ["production", "work-centers", "active"] as const,
};
