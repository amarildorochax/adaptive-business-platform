import type { StockReservation } from './StockReservation';

/**
 * StockReservationRepository — contrato de persistência de Stock Reservation, especificado
 * literalmente por `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9, estendido com `update` (necessário para
 * as transições de status `Active → Released`/`Active → ConvertedToMovement`, ausentes do contrato
 * mínimo do documento mas exigidas pelos próprios Commands `ReleaseStockReservation`/
 * `ConvertReservationToMovement` do Capítulo 7) e com `findById` (necessário para essas mesmas
 * transições localizarem a Reservation antes de alterá-la) — extensão de implementação, nunca uma
 * redefinição de conceito, mesma disciplina já usada quando `PurchaseOrderRepository` precisou de
 * `update` além do mínimo local a cada Sprint de domínio anterior.
 */
export interface StockReservationRepository {
  create(reservation: StockReservation): Promise<StockReservation>;
  update(reservation: StockReservation): Promise<StockReservation>;
  findById(reservationId: string): Promise<StockReservation | undefined>;
  findActiveByProduct(productId: string, locationId?: string): Promise<readonly StockReservation[]>;
  findByOrder(orderId: string): Promise<readonly StockReservation[]>;
}
