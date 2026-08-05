import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncProductionOrderInCaches } from "./productionCache.js";
import type { RegisterProductionConsumptionRequestDto } from "./production.dto.js";

/**
 * Command "RegisterProductionConsumption" (`POST /production-orders/:productionOrderId/consumptions`,
 * IMP-503). Sincroniza apenas a `ProductionOrder` embutida no resultado composto — o novo
 * `ProductionConsumption` já chega como parte do array `productionOrder.consumptions`, nenhuma
 * sincronização própria é necessária (ver `productionCache.ts`, `syncProductionOrderInCaches`).
 * `useTotalConsumedCost` para a mesma ProductionOrder fica desatualizada após este Hook — limitação
 * documentada em `useTotalConsumedCost.ts`.
 */
export function useRegisterProductionConsumption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productionOrderId,
      payload,
    }: {
      readonly productionOrderId: string;
      readonly payload: RegisterProductionConsumptionRequestDto;
    }) => productionClient.registerProductionConsumption(productionOrderId, payload),
    onSuccess: ({ productionOrder }) => syncProductionOrderInCaches(queryClient, productionOrder),
  });
}
