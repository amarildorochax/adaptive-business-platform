import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { syncPurchaseRequisitionInCaches } from "./purchaseCache.js";
import type { EvaluateReorderRuleRequestDto } from "./purchase.dto.js";

/**
 * `evaluateReorderRule` (`POST /reorder-rules/:ruleId/evaluate`, IMP-303) — não é um dos doze
 * Commands aprovados (`PurchaseManager.evaluateReorderRule` devolve `PurchaseEvaluationResult<T>`,
 * sem `command`, per `@abp/purchase-hub`), mas é público no Core e por isso tem Hook próprio, mesma
 * disciplina de exposição já aplicada pela camada HTTP (IMP-303). Sem cache para a Regra em si
 * (nenhuma Query existe); quando a Regra dispara (`triggered: true`), a `PurchaseRequisition`
 * resultante é sincronizada no cache de detalhe, mesmo tratamento de qualquer outra Mutation que
 * produz uma Requisition nova.
 */
export function useEvaluateReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, payload }: { readonly ruleId: string; readonly payload: EvaluateReorderRuleRequestDto }) =>
      purchaseClient.evaluateReorderRule(ruleId, payload),
    onSuccess: (evaluation) => {
      if (evaluation.requisition) {
        syncPurchaseRequisitionInCaches(queryClient, evaluation.requisition);
      }
    },
  });
}
