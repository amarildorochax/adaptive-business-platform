import { useMutation } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";

/** Command "DeactivateReorderRule" (`POST /reorder-rules/:ruleId/deactivate`, IMP-303). Sem sincronização de cache — mesma razão de `useCreateReorderRule`. */
export function useDeactivateReorderRule() {
  return useMutation({
    mutationFn: (ruleId: string) => purchaseClient.deactivateReorderRule(ruleId),
  });
}
