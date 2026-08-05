import { useQuery } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";

/**
 * Consulta a Stock Position (projeção derivada) já recalculada de um Produto
 * (`GET /stock-positions/:productId`, IMP-403) — `undefined` quando ainda não foi recalculada
 * (nenhum Stock Movement jamais registrado), nunca um erro. `queryFn` nunca resolve para `undefined`
 * diretamente — React Query v5 trata isso como erro ("Query data cannot be undefined"), mesmo bug
 * documentado por `useSupplier.ts`/`usePurchaseOrder.ts`: `null` é o sentinela interno, `select` o
 * converte de volta para `undefined`.
 */
export function useStockPosition(productId: string | undefined, locationId?: string) {
  return useQuery({
    queryKey: inventoryMovementQueryKeys.position(productId ?? "", locationId),
    queryFn: async () => {
      if (!productId) {
        throw new Error("productId ausente.");
      }
      return (await inventoryMovementClient.findStockPosition(productId, locationId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: productId !== undefined,
  });
}
