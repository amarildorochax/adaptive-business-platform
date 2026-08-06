import { useQuery } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";

/**
 * Localiza o Tax Regime de um Tenant (`GET /tax-regimes/:tenantId`, IMP-603) — `undefined` quando o
 * Tenant ainda não registrou um, nunca um erro. Mesmo padrão `null`-sentinela + `select` de
 * `useBillOfMaterials.ts`/`useProductionOrder.ts` (Production Hub) — previne o bug "Undefined useQuery"
 * (IMP-204).
 */
export function useTaxRegime(tenantId: string | undefined) {
  return useQuery({
    queryKey: fiscalQueryKeys.taxRegimeByTenant(tenantId ?? ""),
    queryFn: async () => {
      if (!tenantId) {
        throw new Error("tenantId ausente.");
      }
      return (await fiscalClient.findTaxRegimeByTenant(tenantId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: tenantId !== undefined,
  });
}
