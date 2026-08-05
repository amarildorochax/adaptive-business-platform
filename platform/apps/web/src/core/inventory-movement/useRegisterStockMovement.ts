import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { appendStockMovementInCache, syncStockPositionInCache } from "./inventoryMovementCache.js";
import type { RegisterStockMovementRequestDto } from "./inventoryMovement.dto.js";

/**
 * Command "RegisterStockMovement" (`POST /stock-movements`, IMP-403). Sincroniza tanto o ledger
 * (`movementsByProduct`/`movementsByOriginReference`, sempre aditivo — nunca substitui um Movement já
 * cacheado) quanto a Stock Position já recalculada (sempre substituída, nunca aditiva) — o mesmo
 * resultado composto que o Core já produz em uma única operação (`RegisterStockMovementResult`).
 */
export function useRegisterStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterStockMovementRequestDto) => inventoryMovementClient.registerStockMovement(payload),
    onSuccess: ({ movement, position }) => {
      appendStockMovementInCache(queryClient, movement);
      syncStockPositionInCache(queryClient, position);
    },
  });
}
