import type { StockReservation, StockReservationRepository, StockReservationStatus } from "@abp/inventory-movement-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface Row {
  reservation_id: string;
  tenant_id: string;
  product_id: string;
  variant_id: string | null;
  location_id: string | null;
  quantity: number;
  order_id: string;
  status: string;
  expires_at: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * Implementação real de `StockReservationRepository`. Sem tabela filha — sem transação explícita,
 * cada `INSERT`/`UPDATE` já é atômico por natureza do próprio SQLite, mesmo critério de
 * `SqliteReorderRuleRepository` (IMP-302). `update` regrava a linha inteira (nunca um `UPDATE`
 * parcial), mesmo padrão de `SqlitePurchaseOrderRepository`/`SqliteReorderRuleRepository`.
 */
export class SqliteStockReservationRepository implements StockReservationRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(reservation: StockReservation): Promise<StockReservation> {
    this.db
      .prepare(
        "INSERT INTO stock_reservations (reservation_id, tenant_id, product_id, variant_id, location_id, quantity, order_id, status, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        reservation.reservationId,
        reservation.tenantId,
        reservation.productId,
        orNull(reservation.variantId),
        orNull(reservation.locationId),
        reservation.quantity,
        reservation.orderId,
        reservation.status,
        toMsOrNull(reservation.expiresAt),
        toMs(reservation.createdAt),
        toMs(reservation.updatedAt),
      );
    return reservation;
  }

  async update(reservation: StockReservation): Promise<StockReservation> {
    this.db
      .prepare(
        "UPDATE stock_reservations SET tenant_id = ?, product_id = ?, variant_id = ?, location_id = ?, quantity = ?, order_id = ?, status = ?, expires_at = ?, created_at = ?, updated_at = ? WHERE reservation_id = ?",
      )
      .run(
        reservation.tenantId,
        reservation.productId,
        orNull(reservation.variantId),
        orNull(reservation.locationId),
        reservation.quantity,
        reservation.orderId,
        reservation.status,
        toMsOrNull(reservation.expiresAt),
        toMs(reservation.createdAt),
        toMs(reservation.updatedAt),
        reservation.reservationId,
      );
    return reservation;
  }

  async findById(reservationId: string): Promise<StockReservation | undefined> {
    const row = this.db.prepare("SELECT * FROM stock_reservations WHERE reservation_id = ?").get(reservationId) as unknown as Row | undefined;
    return row ? toReservation(row) : undefined;
  }

  async findActiveByProduct(productId: string, locationId?: string): Promise<readonly StockReservation[]> {
    const rows = (
      locationId === undefined
        ? this.db.prepare("SELECT * FROM stock_reservations WHERE product_id = ? AND status = 'Active'").all(productId)
        : this.db
            .prepare("SELECT * FROM stock_reservations WHERE product_id = ? AND location_id = ? AND status = 'Active'")
            .all(productId, locationId)
    ) as unknown as Row[];

    return rows.map(toReservation);
  }

  async findByOrder(orderId: string): Promise<readonly StockReservation[]> {
    const rows = this.db.prepare("SELECT * FROM stock_reservations WHERE order_id = ?").all(orderId) as unknown as Row[];
    return rows.map(toReservation);
  }
}

function toReservation(row: Row): StockReservation {
  return {
    reservationId: row.reservation_id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    variantId: orUndefined(row.variant_id),
    locationId: orUndefined(row.location_id),
    quantity: row.quantity,
    orderId: row.order_id,
    status: row.status as StockReservationStatus,
    expiresAt: fromMsOrUndefined(row.expires_at),
    createdAt: fromMs(row.created_at),
    updatedAt: fromMs(row.updated_at),
  };
}
