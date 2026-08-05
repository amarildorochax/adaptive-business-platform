import { useQuery } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";

/**
 * Lista os Stock Movement de um Produto, em ordem cronológica — o ledger completo
 * (`GET /stock-movements/by-product/:productId`, IMP-403). `locationId` opcional isola por
 * localização quando informado; omitido, devolve movimentações de qualquer localização do Produto.
 */
export function useStockMovementsByProduct(productId: string | undefined, locationId?: string) {
  return useQuery({
    queryKey: inventoryMovementQueryKeys.movementsByProduct(productId ?? "", locationId),
    queryFn: () => {
      if (!productId) {
        throw new Error("productId ausente.");
      }
      return inventoryMovementClient.listStockMovementsByProduct(productId, locationId);
    },
    enabled: productId !== undefined,
  });
}
