import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Soma da quantidade efetivamente gerada em uma ProductionOrder
 * (`GET /production-orders/:productionOrderId/total-generated-quantity`, IMP-503). Mesma disciplina
 * de `useTotalConsumedCost.ts` — nunca trata 404 como estado legítimo, mesma limitação de cache
 * desatualizado após `useRegisterProductionOutput`/`useCompleteProduction`.
 */
export function useTotalGeneratedQuantity(productionOrderId: string | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.totalGeneratedQuantity(productionOrderId ?? ""),
    queryFn: () => {
      if (!productionOrderId) {
        throw new Error("productionOrderId ausente.");
      }
      return productionClient.getTotalGeneratedQuantity(productionOrderId);
    },
    enabled: productionOrderId !== undefined,
  });
}
