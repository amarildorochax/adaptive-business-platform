import { useQuery } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";

/**
 * Localiza uma Tax Rule por identificador (`GET /tax-rules/:taxRuleId`, IMP-603) — `undefined` quando
 * ausente, nunca um erro. Mesmo padrão `null`-sentinela + `select` de `useTaxRegime.ts`.
 */
export function useTaxRule(taxRuleId: string | undefined) {
  return useQuery({
    queryKey: fiscalQueryKeys.taxRule(taxRuleId ?? ""),
    queryFn: async () => {
      if (!taxRuleId) {
        throw new Error("taxRuleId ausente.");
      }
      return (await fiscalClient.findTaxRuleById(taxRuleId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: taxRuleId !== undefined,
  });
}
