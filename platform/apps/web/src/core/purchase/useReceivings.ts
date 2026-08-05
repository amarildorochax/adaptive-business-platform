import { useQuery } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";

/**
 * Lista os Receiving registrados contra um Purchase Order (`GET /purchase-orders/:purchaseOrderId/receivings`,
 * IMP-303). Nomeado `useReceivings` (plural), não `useReceiving()` — IMP-304 cita "useReceiving()"
 * sob o rótulo "Exemplos:", mas o endpoint devolve uma lista (`readonly ReceivingResponseDto[]`),
 * nunca um único Receiving; mesma disciplina já aplicada por `useDisableSupplier` (IMP-204) de
 * preservar a forma real do dado sobre um nome de exemplo aproximado.
 */
export function useReceivings(purchaseOrderId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.receivings(purchaseOrderId ?? ""),
    queryFn: () => {
      if (!purchaseOrderId) {
        throw new Error("purchaseOrderId ausente.");
      }
      return purchaseClient.listReceivingsByPurchaseOrder(purchaseOrderId);
    },
    enabled: purchaseOrderId !== undefined,
  });
}
