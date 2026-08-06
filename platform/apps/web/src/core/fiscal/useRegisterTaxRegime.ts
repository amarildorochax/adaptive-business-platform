import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { syncTaxRegimeInCache } from "./fiscalCache.js";
import type { RegisterTaxRegimeRequestDto } from "./fiscal.dto.js";

/** Command "RegisterTaxRegime" (`POST /tax-regimes`, IMP-603). */
export function useRegisterTaxRegime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterTaxRegimeRequestDto) => fiscalClient.registerTaxRegime(payload),
    onSuccess: (regime) => syncTaxRegimeInCache(queryClient, regime),
  });
}
