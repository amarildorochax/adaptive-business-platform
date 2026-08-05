import { useQuery } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";

/**
 * Localiza um Purchase Order por identificador (`GET /purchase-orders/:purchaseOrderId`, IMP-303) —
 * `undefined` quando ausente, nunca um erro. `queryFn` nunca resolve para `undefined` diretamente —
 * React Query v5 trata isso como erro ("Query data cannot be undefined"), mesmo bug documentado por
 * `useSupplier.ts` (IMP-204): `null` é o sentinela interno, `select` o converte de volta para
 * `undefined`.
 */
export function usePurchaseOrder(purchaseOrderId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.order(purchaseOrderId ?? ""),
    queryFn: async () => {
      if (!purchaseOrderId) {
        throw new Error("purchaseOrderId ausente.");
      }
      return (await purchaseClient.findPurchaseOrderById(purchaseOrderId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: purchaseOrderId !== undefined,
  });
}
