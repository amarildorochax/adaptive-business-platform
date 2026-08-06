import { useQuery } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";

/**
 * Localiza um Fiscal Document por identificador (`GET /fiscal-documents/:fiscalDocumentId`, IMP-603) —
 * `undefined` quando ausente, nunca um erro. Mesmo padrão `null`-sentinela + `select` de
 * `useTaxRegime.ts`/`useTaxRule.ts`.
 */
export function useFiscalDocument(fiscalDocumentId: string | undefined) {
  return useQuery({
    queryKey: fiscalQueryKeys.fiscalDocument(fiscalDocumentId ?? ""),
    queryFn: async () => {
      if (!fiscalDocumentId) {
        throw new Error("fiscalDocumentId ausente.");
      }
      return (await fiscalClient.findFiscalDocumentById(fiscalDocumentId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: fiscalDocumentId !== undefined,
  });
}
