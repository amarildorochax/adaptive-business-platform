import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncProductionOrderInCaches } from "./productionCache.js";
import type { CreateProductionOrderRequestDto } from "./production.dto.js";

/**
 * Command "CreateProductionOrder" (`POST /production-orders`, IMP-503). `productionOrdersByStatus`
 * nunca é atualizada por este Hook — ver limitação documentada em `productionCache.ts`,
 * `syncProductionOrderInCaches`.
 */
export function useCreateProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductionOrderRequestDto) => productionClient.createProductionOrder(payload),
    onSuccess: (order) => syncProductionOrderInCaches(queryClient, order),
  });
}
