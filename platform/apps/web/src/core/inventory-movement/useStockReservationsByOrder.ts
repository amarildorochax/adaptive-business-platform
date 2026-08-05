import { useQuery } from "@tanstack/react-query";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";

/** Lista as Stock Reservation associadas a um Order (Commerce Hub), independente do status (`GET /stock-reservations/by-order/:orderId`, IMP-403). */
export function useStockReservationsByOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: inventoryMovementQueryKeys.reservationsByOrder(orderId ?? ""),
    queryFn: () => {
      if (!orderId) {
        throw new Error("orderId ausente.");
      }
      return inventoryMovementClient.listStockReservationsByOrder(orderId);
    },
    enabled: orderId !== undefined,
  });
}
