import { useMutation } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import type { CreateStockAlertRuleRequestDto } from "./inventoryMovement.dto.js";

/** Command "CreateStockAlertRule" (`POST /stock-alert-rules`, IMP-403). Sem sincronização de cache — nenhuma Query de detalhe/listagem existe para `StockAlertRule` (nem em `InventoryMovementManager`, nem em `apps/api`), mesma razão de `useCreateReorderRule` (Purchase Hub). */
export function useCreateStockAlertRule() {
  return useMutation({
    mutationFn: (payload: CreateStockAlertRuleRequestDto) => inventoryMovementClient.createStockAlertRule(payload),
  });
}
