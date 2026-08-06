import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { syncFiscalDocumentInCaches } from "./fiscalCache.js";
import type { CancelFiscalDocumentRequestDto } from "./fiscal.dto.js";

/** Command "CancelFiscalDocument" (`POST /fiscal-documents/:fiscalDocumentId/cancel`, IMP-603) — única
 * transição posterior permitida a um Fiscal Document já emitido. */
export function useCancelFiscalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fiscalDocumentId, payload }: { readonly fiscalDocumentId: string; readonly payload: CancelFiscalDocumentRequestDto }) =>
      fiscalClient.cancelFiscalDocument(fiscalDocumentId, payload),
    onSuccess: (document) => syncFiscalDocumentInCaches(queryClient, document),
  });
}
