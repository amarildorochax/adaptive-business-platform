import { useMutation } from "@tanstack/react-query";
import { fiscalClient } from "./fiscalClient.js";
import type { EvaluateFiscalObligationsRequestDto } from "./fiscal.dto.js";

/**
 * `evaluateFiscalObligations` (`POST /fiscal-obligations/evaluate-overdue`, IMP-603) — não é um dos
 * oito Commands aprovados (`FiscalEvaluationResult`, sem `command` no retorno do Core), mesmo
 * tratamento de `useEvaluateReorderRule` (Purchase Hub): público no `fiscalClient`, portanto exposto
 * como Hook, per instrução explícita "criar apenas Hooks equivalentes aos métodos públicos".
 *
 * LIMITAÇÃO DOCUMENTADA, não corrigida: transiciona potencialmente várias Fiscal Obligation de
 * `Pending` para `Overdue` de uma só vez — mesma classe de `useFulfillFiscalObligation`, agravada (um
 * lote inteiro, não uma única entrada). Nenhum helper de remoção/movimentação entre
 * `pendingFiscalObligations`/`overdueFiscalObligations` existe nesta plataforma (ver `fiscalCache.ts`).
 * `data.overdue` já traz a lista de recém-vencidas devolvida pelo servidor — o chamador pode usá-la
 * diretamente, mas o cache de `pendingFiscalObligations`/`overdueFiscalObligations` só reflete a
 * mudança após um `invalidateQueries`/`refetch()` manual.
 */
export function useEvaluateFiscalObligations() {
  return useMutation({
    mutationFn: (payload: EvaluateFiscalObligationsRequestDto) => fiscalClient.evaluateFiscalObligations(payload),
  });
}
