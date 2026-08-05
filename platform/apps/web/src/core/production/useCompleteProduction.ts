import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncProductionOrderInCaches } from "./productionCache.js";

/**
 * Command "CompleteProduction" (`POST /production-orders/:productionOrderId/complete`, IMP-503).
 * `productionOrdersByStatus` nunca é atualizada por este Hook — limitação documentada em
 * `productionCache.ts`, `syncProductionOrderInCaches`.
 */
export function useCompleteProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productionOrderId: string) => productionClient.completeProduction(productionOrderId),
    onSuccess: (order) => syncProductionOrderInCaches(queryClient, order),
  });
}
