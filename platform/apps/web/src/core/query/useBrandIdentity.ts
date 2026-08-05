import { useQuery } from "@tanstack/react-query";
import { brandingClient } from "../http/clients/brandingClient.js";

/** Consulta real ao Branding Hub via HTTP (`apps/api`, FUN-004/FUN-005) — `currentTheme`/`currentLogo`, cada um tratando 404 como "nenhum dado ainda". */
export function useBrandIdentity(tenantId: string) {
  return useQuery({
    queryKey: ["branding", "identity", tenantId],
    queryFn: async () => {
      const [theme, logo] = await Promise.all([brandingClient.currentTheme(tenantId), brandingClient.currentLogo(tenantId)]);

      return { theme, logo };
    },
  });
}
