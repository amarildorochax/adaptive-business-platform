import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { appendPendingFiscalObligationInCache } from "./fiscalCache.js";
import type { RegisterFiscalObligationRequestDto } from "./fiscal.dto.js";

/** Command "RegisterFiscalObligation" (`POST /fiscal-obligations`, IMP-603) — toda nova instância nasce
 * `Pending`, acrescentada à lista já cacheada (ver `appendPendingFiscalObligationInCache`). */
export function useRegisterFiscalObligation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterFiscalObligationRequestDto) => fiscalClient.registerFiscalObligation(payload),
    onSuccess: (obligation) => appendPendingFiscalObligationInCache(queryClient, obligation),
  });
}
