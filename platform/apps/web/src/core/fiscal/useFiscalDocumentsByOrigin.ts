import { useQuery } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";

/**
 * Lista os Fiscal Document originados de um Order (Commerce Hub) específico
 * (`GET /fiscal-documents/by-origin/:orderId`, IMP-603). Lista vazia quando nenhum existe, nunca
 * `undefined` — mesmo padrão de `useProductionOrdersByOrigin.ts`.
 */
export function useFiscalDocumentsByOrigin(orderId: string | undefined) {
  return useQuery({
    queryKey: fiscalQueryKeys.fiscalDocumentsByOrigin(orderId ?? ""),
    queryFn: () => {
      if (!orderId) {
        throw new Error("orderId ausente.");
      }
      return fiscalClient.listFiscalDocumentsByOrigin(orderId);
    },
    enabled: orderId !== undefined,
  });
}
