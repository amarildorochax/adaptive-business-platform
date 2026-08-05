import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncProductionOrderInCaches } from "./productionCache.js";
import type { RegisterProductionOutputRequestDto } from "./production.dto.js";

/**
 * Command "RegisterProductionOutput" (`POST /production-orders/:productionOrderId/outputs`, IMP-503).
 * Mesma disciplina de `useRegisterProductionConsumption.ts` — apenas a `ProductionOrder` embutida é
 * sincronizada; `useTotalGeneratedQuantity` fica desatualizada, limitação documentada em
 * `useTotalGeneratedQuantity.ts`.
 */
export function useRegisterProductionOutput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productionOrderId, payload }: { readonly productionOrderId: string; readonly payload: RegisterProductionOutputRequestDto }) =>
      productionClient.registerProductionOutput(productionOrderId, payload),
    onSuccess: ({ productionOrder }) => syncProductionOrderInCaches(queryClient, productionOrder),
  });
}
