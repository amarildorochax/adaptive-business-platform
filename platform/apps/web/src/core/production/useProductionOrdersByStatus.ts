import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";
import type { ProductionStatusDto } from "./production.dto.js";

/**
 * Lista as ProductionOrder em um dado status (`GET /production-orders/by-status/:status`, IMP-503) —
 * `status` é um parâmetro obrigatório do próprio endpoint (não existe "listar todos os status" em
 * `ProductionManager`), portanto obrigatório também aqui, mesmo formato de `usePurchaseRequisitions`.
 *
 * LIMITAÇÃO CONHECIDA (mesma classe de `requisitionsByStatus`, IMP-304) — o cache desta lista nunca é
 * atualizado automaticamente por `useStartProduction`/`useCompleteProduction`/`useCancelProduction`;
 * ver `productionCache.ts`, `syncProductionOrderInCaches`.
 */
export function useProductionOrdersByStatus(status: ProductionStatusDto | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.productionOrdersByStatus(status ?? ""),
    queryFn: () => {
      if (!status) {
        throw new Error("status ausente.");
      }
      return productionClient.listProductionOrdersByStatus(status);
    },
    enabled: status !== undefined,
  });
}
