import { useQuery } from "@tanstack/react-query";
import { brandingClient } from "../http/clients/brandingClient.js";

/**
 * Consulta real ao único endpoint de integração unidirecional Business Profile → Branding
 * (`BrandingManager.businessContext`, Capítulo 12 de `BRANDING_HUB.md`) — Segmento/Subsegmento/
 * Maturidade do Business Profile, consumidos aqui apenas como dado de leitura (Branding nunca
 * escreve de volta no Business Profile).
 */
export function useBusinessContext(profileId: string | undefined) {
  return useQuery({
    queryKey: ["branding", "context", profileId],
    queryFn: () => {
      if (!profileId) {
        throw new Error("profileId ausente.");
      }
      return brandingClient.businessContext(profileId);
    },
    enabled: profileId !== undefined,
  });
}
