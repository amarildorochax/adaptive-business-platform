import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseOrderInCaches } from "./purchaseCache.js";
import type { AddPurchaseOrderItemRequestDto } from "./purchase.dto.js";

/** Command "AddPurchaseOrderItem" (`POST /purchase-orders/:purchaseOrderId/items`, IMP-303). */
export function useAddPurchaseOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrderId, payload }: { readonly purchaseOrderId: string; readonly payload: AddPurchaseOrderItemRequestDto }) =>
      purchaseClient.addPurchaseOrderItem(purchaseOrderId, payload),
    onSuccess: (purchaseOrder) => syncPurchaseOrderInCaches(queryClient, purchaseOrder),
  });
}
