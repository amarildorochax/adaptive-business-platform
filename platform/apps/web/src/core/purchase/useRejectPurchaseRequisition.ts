import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseRequisitionInCaches } from "./purchaseCache.js";

/** Command "RejectPurchaseRequisition" (`POST /purchase-requisitions/:requisitionId/reject`, IMP-303). */
export function useRejectPurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requisitionId: string) => purchaseClient.rejectPurchaseRequisition(requisitionId),
    onSuccess: (requisition) => syncPurchaseRequisitionInCaches(queryClient, requisition),
  });
}
