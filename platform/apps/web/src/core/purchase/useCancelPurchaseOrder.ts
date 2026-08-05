import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseOrderInCaches } from "./purchaseCache.js";

/** Command "CancelPurchaseOrder" (`POST /purchase-orders/:purchaseOrderId/cancel`, IMP-303). */
export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseOrderId: string) => purchaseClient.cancelPurchaseOrder(purchaseOrderId),
    onSuccess: (purchaseOrder) => syncPurchaseOrderInCaches(queryClient, purchaseOrder),
  });
}
