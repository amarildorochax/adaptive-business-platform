import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Lista os Work Center ativos (`GET /work-centers/active`, IMP-503) — sem parâmetro (limitação
 * herdada do Core/Persistência/HTTP, IMP-501/502/503: nenhum `tenantId` no endpoint), por isso sempre
 * habilitada, diferente de `useActiveStockLocations` (Inventory Movement Hub), que exige `tenantId`.
 */
export function useActiveWorkCenters() {
  return useQuery({
    queryKey: productionQueryKeys.activeWorkCenters(),
    queryFn: () => productionClient.listActiveWorkCenters(),
  });
}
