import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncProductionOrderInCaches } from "./productionCache.js";
import type { CancelProductionRequestDto } from "./production.dto.js";

/**
 * Command "CancelProduction" (`POST /production-orders/:productionOrderId/cancel`, IMP-503).
 * `productionOrdersByStatus` nunca é atualizada por este Hook — mesma limitação documentada em
 * `productionCache.ts`.
 */
export function useCancelProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productionOrderId, payload }: { readonly productionOrderId: string; readonly payload: CancelProductionRequestDto }) =>
      productionClient.cancelProduction(productionOrderId, payload),
    onSuccess: (order) => syncProductionOrderInCaches(queryClient, order),
  });
}
