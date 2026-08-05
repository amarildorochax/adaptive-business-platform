import { useQuery } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";

/** Lista as Stock Location ativas de um Tenant (`GET /stock-locations/by-tenant/:tenantId/active`, IMP-403). */
export function useActiveStockLocations(tenantId: string | undefined) {
  return useQuery({
    queryKey: inventoryMovementQueryKeys.activeLocationsByTenant(tenantId ?? ""),
    queryFn: () => {
      if (!tenantId) {
        throw new Error("tenantId ausente.");
      }
      return inventoryMovementClient.listActiveStockLocationsByTenant(tenantId);
    },
    enabled: tenantId !== undefined,
  });
}
