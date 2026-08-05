import { computeQuantityAvailable, type StockPosition, type StockPositionRepository } from "@abp/inventory-movement-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined } from "../../db/sqlUtil.js";

interface Row {
  position_key: string;
  product_id: string;
  location_id: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  recalculated_at: number;
}

interface SumRow {
  total: number;
}

function positionKey(productId: string, locationId: string | undefined): string {
  return `${productId}::${locationId ?? ""}`;
}

/**
 * Implementação real de `StockPositionRepository`. `recalculate` é, por desenho arquitetural
 * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 9 — `recalculate` como método do próprio Repository, não do
 * Service que o consome), o único lugar de toda a plataforma onde a soma do ledger de fato acontece:
 * dois agregados SQL — `SUM(quantity_delta)` sobre `stock_movements`, `SUM(quantity)` sobre
 * `stock_reservations` ativas — seguidos de um upsert em `stock_positions`, o cache de leitura
 * consultado por `findByProduct`. `computeQuantityAvailable` é reaproveitado de
 * `@abp/inventory-movement-hub` — a mesma função pura já aprovada pelo Core (`InventoryPolicy.ts`),
 * nunca uma subtração reimplementada em paralelo aqui; a soma em si (`SUM`) é derivação aritmética
 * sobre o ledger, não uma regra de negócio nova desta camada — nenhuma decisão de `InventoryPolicy`/
 * `InventoryValidator` (ex.: `shouldTriggerStockAlert`, `ensureReservationWithinAvailable`) é
 * duplicada aqui.
 *
 * LIMITAÇÃO HERDADA DO CORE (documentada, per instrução de IMP-402 — "Nunca corrigir
 * silenciosamente"): nem `findByProduct` nem `recalculate` recebem `variantId` — a interface está
 * congelada nesta Sprint (`StockPositionRepository.ts`, Core). A soma é, portanto, sobre TODOS os
 * variants de um Produto na mesma Localização combinados — `variantId` no `StockPosition` retornado é
 * sempre `undefined`, nunca inventado a partir de um variant "representativo" arbitrário. Já
 * documentada como divergência em `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`, Seção 11.2;
 * permanece sem solução nesta Sprint pela mesma razão — a interface é Repository Interface, congelada.
 *
 * A leitura (duas somas) e a escrita (upsert) rodam dentro de uma única transação `BEGIN
 * IMMEDIATE`/`COMMIT` — `IMMEDIATE` adquire o lock de escrita já no início, evitando que um
 * `append`/`create` concorrente altere o ledger entre a soma e a gravação da projeção (uma janela de
 * leitura-e-escrita que, sem isso, não seria atômica).
 */
export class SqliteStockPositionRepository implements StockPositionRepository {
  constructor(private readonly db: DatabaseSync) {}

  async findByProduct(productId: string, locationId?: string): Promise<StockPosition | undefined> {
    const row = this.db
      .prepare("SELECT * FROM stock_positions WHERE position_key = ?")
      .get(positionKey(productId, locationId)) as unknown as Row | undefined;

    return row ? toPosition(row) : undefined;
  }

  async recalculate(productId: string, locationId?: string): Promise<StockPosition> {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const quantityOnHand = this.sumMovements(productId, locationId);
      const quantityReserved = this.sumActiveReservations(productId, locationId);
      const quantityAvailable = computeQuantityAvailable(quantityOnHand, quantityReserved);
      const recalculatedAt = Date.now();

      this.db
        .prepare(
          `INSERT INTO stock_positions (position_key, product_id, location_id, quantity_on_hand, quantity_reserved, quantity_available, recalculated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (position_key) DO UPDATE SET
             quantity_on_hand = excluded.quantity_on_hand,
             quantity_reserved = excluded.quantity_reserved,
             quantity_available = excluded.quantity_available,
             recalculated_at = excluded.recalculated_at`,
        )
        .run(
          positionKey(productId, locationId),
          productId,
          orNull(locationId),
          quantityOnHand,
          quantityReserved,
          quantityAvailable,
          recalculatedAt,
        );

      this.db.exec("COMMIT");

      return {
        productId,
        locationId,
        quantityOnHand,
        quantityReserved,
        quantityAvailable,
        recalculatedAt: fromMs(recalculatedAt),
      };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  private sumMovements(productId: string, locationId?: string): number {
    const row = (
      locationId === undefined
        ? this.db.prepare("SELECT COALESCE(SUM(quantity_delta), 0) AS total FROM stock_movements WHERE product_id = ?").get(productId)
        : this.db
            .prepare("SELECT COALESCE(SUM(quantity_delta), 0) AS total FROM stock_movements WHERE product_id = ? AND location_id = ?")
            .get(productId, locationId)
    ) as unknown as SumRow;

    return row.total;
  }

  private sumActiveReservations(productId: string, locationId?: string): number {
    const row = (
      locationId === undefined
        ? this.db
            .prepare("SELECT COALESCE(SUM(quantity), 0) AS total FROM stock_reservations WHERE product_id = ? AND status = 'Active'")
            .get(productId)
        : this.db
            .prepare(
              "SELECT COALESCE(SUM(quantity), 0) AS total FROM stock_reservations WHERE product_id = ? AND location_id = ? AND status = 'Active'",
            )
            .get(productId, locationId)
    ) as unknown as SumRow;

    return row.total;
  }
}

function toPosition(row: Row): StockPosition {
  return {
    productId: row.product_id,
    locationId: orUndefined(row.location_id),
    quantityOnHand: row.quantity_on_hand,
    quantityReserved: row.quantity_reserved,
    quantityAvailable: row.quantity_available,
    recalculatedAt: fromMs(row.recalculated_at),
  };
}
