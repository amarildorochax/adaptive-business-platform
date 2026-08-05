import { useQuery } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";

export type PurchaseRequisitionStatusFilter = "Open" | "Approved" | "Rejected" | "ConvertedToPurchaseOrder";

/**
 * Lista as Purchase Requisition de um Tenant por status (`GET /purchase-requisitions/by-tenant/:tenantId/status/:status`,
 * IMP-303) — `status` é um parâmetro obrigatório do próprio endpoint (não existe "listar todos os
 * status" em `PurchaseManager`, ver `PurchaseManager.listPurchaseRequisitionsByStatus`), portanto
 * obrigatório também aqui.
 */
export function usePurchaseRequisitions(tenantId: string | undefined, status: PurchaseRequisitionStatusFilter | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.requisitionsByStatus(tenantId ?? "", status ?? ""),
    queryFn: () => {
      if (!tenantId || !status) {
        throw new Error("tenantId/status ausente.");
      }
      return purchaseClient.listPurchaseRequisitionsByStatus(tenantId, status);
    },
    enabled: tenantId !== undefined && status !== undefined,
  });
}
