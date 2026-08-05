import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseOrderInCaches, syncPurchaseRequisitionInCaches } from "./purchaseCache.js";
import type { ConvertRequisitionToPurchaseOrderRequestDto } from "./purchase.dto.js";

/** Command "ConvertRequisitionToPurchaseOrder" (`POST /purchase-requisitions/:requisitionId/convert`, IMP-303). Sincroniza ambas as Entidades do resultado composto — a Requisition atualizada e o novo Purchase Order. */
export function useConvertRequisitionToPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requisitionId,
      payload,
    }: {
      readonly requisitionId: string;
      readonly payload: ConvertRequisitionToPurchaseOrderRequestDto;
    }) => purchaseClient.convertRequisitionToPurchaseOrder(requisitionId, payload),
    onSuccess: (conversion) => {
      syncPurchaseRequisitionInCaches(queryClient, conversion.requisition);
      syncPurchaseOrderInCaches(queryClient, conversion.purchaseOrder);
    },
  });
}
