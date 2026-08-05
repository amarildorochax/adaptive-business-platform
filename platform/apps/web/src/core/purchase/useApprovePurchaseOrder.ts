import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseOrderInCaches } from "./purchaseCache.js";
import type { ApprovePurchaseOrderRequestDto } from "./purchase.dto.js";

/**
 * Command "ApprovePurchaseOrder" (`POST /purchase-orders/:purchaseOrderId/approve`, IMP-303).
 *
 * IMP-304 cita "useApprovePurchase()" como exemplo de nome — mas o vocabulário já consolidado do
 * Purchase Hub, do Core (IMP-301: `approvePurchaseOrder`) ao HTTP (IMP-303:
 * `POST /purchase-orders/:purchaseOrderId/approve`), usa exclusivamente "ApprovePurchaseOrder";
 * "ApprovePurchase" (sem "Order") não aparece em nenhum documento ou código já aprovado. Nomeado
 * aqui `useApprovePurchaseOrder`, mesma disciplina de `useDisableSupplier` (IMP-204) diante do
 * mesmo tipo de exemplo aproximado.
 */
export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrderId, payload }: { readonly purchaseOrderId: string; readonly payload: ApprovePurchaseOrderRequestDto }) =>
      purchaseClient.approvePurchaseOrder(purchaseOrderId, payload),
    onSuccess: (purchaseOrder) => syncPurchaseOrderInCaches(queryClient, purchaseOrder),
  });
}
