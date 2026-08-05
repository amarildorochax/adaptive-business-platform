import { useQuery } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";

/**
 * Lista os Purchase Order ainda abertos de um Tenant (`GET /purchase-orders/by-tenant/:tenantId/open`,
 * IMP-303) — a única listagem de Purchase Order que recebe apenas um `tenantId`, mesma forma de
 * `useSuppliers(tenantId)` (IMP-204). Ver `usePurchaseOrdersBySupplier` para a listagem por Fornecedor.
 */
export function usePurchaseOrders(tenantId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.openOrdersByTenant(tenantId ?? ""),
    queryFn: () => {
      if (!tenantId) {
        throw new Error("tenantId ausente.");
      }
      return purchaseClient.listOpenPurchaseOrdersByTenant(tenantId);
    },
    enabled: tenantId !== undefined,
  });
}
