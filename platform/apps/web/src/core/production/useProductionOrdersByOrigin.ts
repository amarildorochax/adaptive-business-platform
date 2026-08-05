import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Lista as ProductionOrder originadas de um Order (Commerce Hub) específico
 * (`GET /production-orders/by-origin/:orderId`, IMP-503).
 */
export function useProductionOrdersByOrigin(orderId: string | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.productionOrdersByOrigin(orderId ?? ""),
    queryFn: () => {
      if (!orderId) {
        throw new Error("orderId ausente.");
      }
      return productionClient.listProductionOrdersByOrigin(orderId);
    },
    enabled: orderId !== undefined,
  });
}
