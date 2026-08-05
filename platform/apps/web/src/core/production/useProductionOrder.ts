import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Localiza uma ProductionOrder por identificador (`GET /production-orders/:productionOrderId`,
 * IMP-503) — `undefined` quando ausente, nunca um erro. Mesmo padrão `null`/`select` de
 * `useBillOfMaterials.ts`.
 */
export function useProductionOrder(productionOrderId: string | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.productionOrder(productionOrderId ?? ""),
    queryFn: async () => {
      if (!productionOrderId) {
        throw new Error("productionOrderId ausente.");
      }
      return (await productionClient.findProductionOrderById(productionOrderId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: productionOrderId !== undefined,
  });
}
