import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { syncStockReservationInCaches } from "./inventoryMovementCache.js";

/** Command "ReleaseStockReservation" (`POST /stock-reservations/:reservationId/release`, IMP-403). */
export function useReleaseStockReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => inventoryMovementClient.releaseStockReservation(reservationId),
    onSuccess: (reservation) => syncStockReservationInCaches(queryClient, reservation),
  });
}
