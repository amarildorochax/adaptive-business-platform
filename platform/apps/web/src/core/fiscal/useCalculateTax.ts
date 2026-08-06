import { useMutation } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import type { CalculateTaxRequestDto } from "./fiscal.dto.js";

/**
 * Command "CalculateTax" (`POST /tax-calculations`, IMP-603). Nenhuma sincronização de cache —
 * `TaxCalculation` não possui nenhuma Query própria em nenhuma camada (nem Repository no Core,
 * `TaxCalculation.ts`); o resultado desta Mutation é consumido diretamente pelo chamador (`data`) para
 * compor o corpo de uma chamada subsequente a `useIssueFiscalDocument`, nunca lido de volta do cache.
 * Estratégia 5 (Seção "Auditoria" de `fiscalCache.ts`).
 */
export function useCalculateTax() {
  return useMutation({
    mutationFn: (payload: CalculateTaxRequestDto) => fiscalClient.calculateTax(payload),
  });
}
