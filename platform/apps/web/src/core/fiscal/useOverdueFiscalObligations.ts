import { useQuery } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";

/** Lista as Fiscal Obligation em `Overdue` (`GET /fiscal-obligations/overdue`, IMP-603) — sem
 * parâmetro, mesmo formato de `usePendingFiscalObligations.ts`. */
export function useOverdueFiscalObligations() {
  return useQuery({
    queryKey: fiscalQueryKeys.overdueFiscalObligations(),
    queryFn: () => fiscalClient.listOverdueFiscalObligations(),
  });
}
