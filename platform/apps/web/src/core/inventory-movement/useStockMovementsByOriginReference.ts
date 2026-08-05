import { useQuery } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";

/** Lista os Stock Movement originados de um Purchase Order/Production Order/Order específico (`GET /stock-movements/by-origin-reference/:originReferenceId`, IMP-403). */
export function useStockMovementsByOriginReference(originReferenceId: string | undefined) {
  return useQuery({
    queryKey: inventoryMovementQueryKeys.movementsByOriginReference(originReferenceId ?? ""),
    queryFn: () => {
      if (!originReferenceId) {
        throw new Error("originReferenceId ausente.");
      }
      return inventoryMovementClient.listStockMovementsByOriginReference(originReferenceId);
    },
    enabled: originReferenceId !== undefined,
  });
}
