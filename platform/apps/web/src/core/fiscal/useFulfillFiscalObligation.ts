import { useMutation } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";

/**
 * Command "MarkFiscalObligationFulfilled" (`POST /fiscal-obligations/:fiscalObligationId/fulfill`,
 * IMP-603).
 *
 * LIMITAÇÃO DOCUMENTADA, não corrigida: esta Mutation nunca sincroniza `pendingFiscalObligations`/
 * `overdueFiscalObligations` — a Fiscal Obligation atualizada (`Fulfilled`) deveria ser REMOVIDA de
 * qualquer uma das duas listas em que estivesse cacheada, mas nenhum helper de remoção existe nesta
 * plataforma (ver `fiscalCache.ts`, nota em `appendPendingFiscalObligationInCache`). O chamador
 * (futuro Workspace) deve invalidar/refazer ambas as listas manualmente após usar este Hook, ou aceitar
 * as listas desatualizadas até a próxima consulta real. O objeto atualizado continua disponível
 * normalmente via `data`, apenas o cache de lista não é tocado.
 */
export function useFulfillFiscalObligation() {
  return useMutation({
    mutationFn: (fiscalObligationId: string) => fiscalClient.fulfillFiscalObligation(fiscalObligationId),
  });
}
