import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { appendStockMovementInCache, syncStockPositionInCache, syncStockReservationInCaches } from "./inventoryMovementCache.js";

/**
 * Command "ConvertReservationToMovement" (`POST /stock-reservations/:reservationId/convert`, IMP-403).
 * Sincroniza os três resultados compostos que `ConvertReservationToMovementResponseDto` carrega — a
 * Reservation já convertida, o novo Stock Movement de saída (sempre aditivo no ledger, nunca
 * substitui), e a Stock Position já recalculada — mesma disciplina de `useRegisterStockMovement` para
 * o par Movement/Position.
 */
export function useConvertReservationToMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => inventoryMovementClient.convertReservationToMovement(reservationId),
    onSuccess: ({ reservation, movement, position }) => {
      syncStockReservationInCaches(queryClient, reservation);
      appendStockMovementInCache(queryClient, movement);
      syncStockPositionInCache(queryClient, position);
    },
  });
}
