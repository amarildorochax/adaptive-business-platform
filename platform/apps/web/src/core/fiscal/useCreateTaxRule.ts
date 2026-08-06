import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { syncTaxRuleInCache } from "./fiscalCache.js";
import type { CreateTaxRuleRequestDto } from "./fiscal.dto.js";

/** Command "CreateTaxRule" (`POST /tax-rules`, IMP-603). */
export function useCreateTaxRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaxRuleRequestDto) => fiscalClient.createTaxRule(payload),
    onSuccess: (rule) => syncTaxRuleInCache(queryClient, rule),
  });
}
