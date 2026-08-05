import { useMutation } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import type { CreateReorderRuleRequestDto } from "./purchase.dto.js";

/** Command "CreateReorderRule" (`POST /reorder-rules`, IMP-303). Sem sincronização de cache — nenhuma Query de detalhe/listagem existe para `ReorderRule` (nem em `PurchaseManager`, nem em `apps/api`), mesma razão de `useRegisterSupplierCatalogItem` (IMP-204). */
export function useCreateReorderRule() {
  return useMutation({
    mutationFn: (payload: CreateReorderRuleRequestDto) => purchaseClient.createReorderRule(payload),
  });
}
