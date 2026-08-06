import { useQuery } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";

/** Lista as Fiscal Obligation em `Pending` (`GET /fiscal-obligations/pending`, IMP-603) — sem
 * parâmetro, mesmo formato de `useActiveWorkCenters.ts` (Production Hub). */
export function usePendingFiscalObligations() {
  return useQuery({
    queryKey: fiscalQueryKeys.pendingFiscalObligations(),
    queryFn: () => fiscalClient.listPendingFiscalObligations(),
  });
}
