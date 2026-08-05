import { useQuery } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";

/** Lista os Purchase Order de um Fornecedor (`GET /purchase-orders/by-supplier/:supplierId`, IMP-303). */
export function usePurchaseOrdersBySupplier(supplierId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.ordersBySupplier(supplierId ?? ""),
    queryFn: () => {
      if (!supplierId) {
        throw new Error("supplierId ausente.");
      }
      return purchaseClient.listPurchaseOrdersBySupplier(supplierId);
    },
    enabled: supplierId !== undefined,
  });
}
