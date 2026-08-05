import { useQuery } from "@tanstack/react-query";
import { businessProfileClient } from "../http/clients/businessProfileClient.js";

/**
 * Consulta o Business Profile completo de um Tenant (`GET /business-profiles/by-tenant/:tenantId`,
 * já existente desde a FUN-004) — usado por `OverviewSection` (FUN-101) para exibir `createdAt`
 * ("Data de criação"), o único campo de `BusinessProfileResponseDto` ainda não consumido por nenhum
 * hook do Frontend antes desta Sprint (`useDashboardBootstrap`/`seedDemoData` descarta o restante do
 * DTO depois de extrair `profileId`). Endpoint já existente — nenhuma rota nova.
 */
export function useBusinessProfile(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["business-profile", "profile", tenantId],
    queryFn: () => {
      if (!tenantId) {
        throw new Error("tenantId ausente.");
      }
      return businessProfileClient.findByTenant(tenantId);
    },
    enabled: tenantId !== undefined,
  });
}
