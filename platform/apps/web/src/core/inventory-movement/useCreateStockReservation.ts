import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { syncStockReservationInCaches } from "./inventoryMovementCache.js";
import type { CreateStockReservationRequestDto } from "./inventoryMovement.dto.js";

/** Command "CreateStockReservation" (`POST /stock-reservations`, IMP-403). */
export function useCreateStockReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockReservationRequestDto) => inventoryMovementClient.createStockReservation(payload),
    onSuccess: (reservation) => syncStockReservationInCaches(queryClient, reservation),
  });
}
