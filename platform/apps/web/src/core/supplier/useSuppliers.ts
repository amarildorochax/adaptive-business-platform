import { useQuery } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { supplierQueryKeys } from "./supplierQueryKeys.js";

/** Lista os Supplier ativos de um Tenant (`GET /suppliers/by-tenant/:tenantId`, IMP-203). */
export function useSuppliers(tenantId: string | undefined) {
  return useQuery({
    queryKey: supplierQueryKeys.list(tenantId ?? ""),
    queryFn: () => {
      if (!tenantId) {
        throw new Error("tenantId ausente.");
      }
      return supplierClient.listByTenant(tenantId);
    },
    enabled: tenantId !== undefined,
  });
}
