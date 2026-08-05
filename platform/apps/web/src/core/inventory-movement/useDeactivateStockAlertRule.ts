import { useMutation } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";

/** Command "DeactivateStockAlertRule" (`POST /stock-alert-rules/:ruleId/deactivate`, IMP-403). Sem sincronização de cache — mesma razão de `useCreateStockAlertRule`. */
export function useDeactivateStockAlertRule() {
  return useMutation({
    mutationFn: (ruleId: string) => inventoryMovementClient.deactivateStockAlertRule(ruleId),
  });
}
