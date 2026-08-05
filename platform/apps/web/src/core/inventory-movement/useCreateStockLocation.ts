import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { appendStockLocationInCache } from "./inventoryMovementCache.js";
import type { CreateStockLocationRequestDto } from "./inventoryMovement.dto.js";

/** Command "CreateStockLocation" (`POST /stock-locations`, IMP-403). */
export function useCreateStockLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockLocationRequestDto) => inventoryMovementClient.createStockLocation(payload),
    onSuccess: (location) => appendStockLocationInCache(queryClient, location),
  });
}
