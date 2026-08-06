import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { syncFiscalDocumentInCaches } from "./fiscalCache.js";
import type { IssueFiscalDocumentRequestDto } from "./fiscal.dto.js";

/** Command "IssueFiscalDocument" (`POST /fiscal-documents`, IMP-603). */
export function useIssueFiscalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueFiscalDocumentRequestDto) => fiscalClient.issueFiscalDocument(payload),
    onSuccess: (document) => syncFiscalDocumentInCaches(queryClient, document),
  });
}
