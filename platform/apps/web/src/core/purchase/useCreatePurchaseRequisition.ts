import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseRequisitionInCaches } from "./purchaseCache.js";
import type { CreatePurchaseRequisitionRequestDto } from "./purchase.dto.js";

/** Command "CreatePurchaseRequisition" (`POST /purchase-requisitions`, IMP-303). */
export function useCreatePurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseRequisitionRequestDto) => purchaseClient.createPurchaseRequisition(payload),
    onSuccess: (requisition) => syncPurchaseRequisitionInCaches(queryClient, requisition),
  });
}
