import { useQuery } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";

/** Localiza uma Purchase Requisition por identificador (`GET /purchase-requisitions/:requisitionId`, IMP-303) — `undefined` quando ausente, mesma disciplina de `usePurchaseOrder`. */
export function usePurchaseRequisition(requisitionId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.requisition(requisitionId ?? ""),
    queryFn: async () => {
      if (!requisitionId) {
        throw new Error("requisitionId ausente.");
      }
      return (await purchaseClient.findPurchaseRequisitionById(requisitionId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: requisitionId !== undefined,
  });
}
