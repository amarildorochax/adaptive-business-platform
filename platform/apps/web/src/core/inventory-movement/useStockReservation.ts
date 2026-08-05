import { useQuery } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";

/** Localiza uma Stock Reservation por identificador (`GET /stock-reservations/:reservationId`, IMP-403) — `undefined` quando ausente, nunca um erro. Mesmo padrão de sentinela `null`/`select` de `useStockPosition`. */
export function useStockReservation(reservationId: string | undefined) {
  return useQuery({
    queryKey: inventoryMovementQueryKeys.reservation(reservationId ?? ""),
    queryFn: async () => {
      if (!reservationId) {
        throw new Error("reservationId ausente.");
      }
      return (await inventoryMovementClient.findStockReservationById(reservationId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: reservationId !== undefined,
  });
}
