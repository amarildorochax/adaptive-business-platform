import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseOrderInCaches } from "./purchaseCache.js";
import type { CreatePurchaseOrderRequestDto } from "./purchase.dto.js";

/** Command "CreatePurchaseOrder" (`POST /purchase-orders`, IMP-303). */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderRequestDto) => purchaseClient.createPurchaseOrder(payload),
    onSuccess: (purchaseOrder) => syncPurchaseOrderInCaches(queryClient, purchaseOrder),
  });
}
