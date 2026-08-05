import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseOrderInCaches } from "./purchaseCache.js";

/** Command "SendPurchaseOrderToSupplier" (`POST /purchase-orders/:purchaseOrderId/send`, IMP-303). */
export function useSendPurchaseOrderToSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseOrderId: string) => purchaseClient.sendPurchaseOrderToSupplier(purchaseOrderId),
    onSuccess: (purchaseOrder) => syncPurchaseOrderInCaches(queryClient, purchaseOrder),
  });
}
