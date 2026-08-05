import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseRequisitionInCaches } from "./purchaseCache.js";

/** Command "ApprovePurchaseRequisition" (`POST /purchase-requisitions/:requisitionId/approve`, IMP-303). */
export function useApprovePurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requisitionId: string) => purchaseClient.approvePurchaseRequisition(requisitionId),
    onSuccess: (requisition) => syncPurchaseRequisitionInCaches(queryClient, requisition),
  });
}
