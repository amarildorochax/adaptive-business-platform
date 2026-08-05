import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncProductionOrderInCaches } from "./productionCache.js";
import type { StartProductionRequestDto } from "./production.dto.js";

/**
 * Command "StartProduction" (`POST /production-orders/:productionOrderId/start`, IMP-503). Sincroniza
 * a `ProductionOrder` embutida em `StartProductionResponseDto.productionOrder` — transicionada para
 * `InProgress` quando `started: true`, ou permanece `Planned` quando insumo insuficiente (nunca um
 * erro HTTP, per IMP-503). `result.started` fica disponível ao chamador via `data.started`, nunca
 * inferido a partir do `status` sozinho.
 */
export function useStartProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productionOrderId, payload }: { readonly productionOrderId: string; readonly payload: StartProductionRequestDto }) =>
      productionClient.startProduction(productionOrderId, payload),
    onSuccess: ({ productionOrder }) => syncProductionOrderInCaches(queryClient, productionOrder),
  });
}
