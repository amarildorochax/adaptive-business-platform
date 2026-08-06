import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { syncTaxRuleInCache } from "./fiscalCache.js";

/** Command "DeactivateTaxRule" (`POST /tax-rules/:taxRuleId/deactivate`, IMP-603) — nunca exclui o
 * registro, apenas `active: false`. Nenhuma lista existe para sincronizar (ver `fiscalCache.ts`). */
export function useDeactivateTaxRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taxRuleId: string) => fiscalClient.deactivateTaxRule(taxRuleId),
    onSuccess: (rule) => syncTaxRuleInCache(queryClient, rule),
  });
}
