import type { MovementOrigin, StockMovement, StockMovementRepository } from "@abp/inventory-movement-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface Row {
  movement_id: string;
  tenant_id: string;
  product_id: string;
  variant_id: string | null;
  location_id: string | null;
  quantity_delta: number;
  origin: string;
  origin_reference_id: string | null;
  occurred_at: number;
}

/**
 * Implementação real de `StockMovementRepository`. Append-only por desenho: `append` é o único
 * método de escrita da interface (Core, congelada nesta Sprint — nenhum `update`/`delete` existe no
 * contrato). A migration (`0004_inventory_movement_hub.sql`) reforça a mesma garantia um nível abaixo,
 * via dois triggers que rejeitam qualquer UPDATE/DELETE em `stock_movements` — mesmo um executado fora
 * deste Repository. Nenhuma transação explícita aqui — `append` é um único `INSERT`, atômico por
 * natureza do próprio SQLite, mesmo critério já usado por `SqliteReorderRuleRepository` (IMP-302) para
 * toda Entidade sem tabela filha.
 */
export class SqliteStockMovementRepository implements StockMovementRepository {
  constructor(private readonly db: DatabaseSync) {}

  async append(movement: StockMovement): Promise<StockMovement> {
    this.db
      .prepare(
        "INSERT INTO stock_movements (movement_id, tenant_id, product_id, variant_id, location_id, quantity_delta, origin, origin_reference_id, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        movement.movementId,
        movement.tenantId,
        movement.productId,
        orNull(movement.variantId),
        orNull(movement.locationId),
        movement.quantityDelta,
        movement.origin,
        orNull(movement.originReferenceId),
        toMs(movement.occurredAt),
      );
    return movement;
  }

  async findByProduct(productId: string, locationId?: string): Promise<readonly StockMovement[]> {
    const rows = (
      locationId === undefined
        ? this.db.prepare("SELECT * FROM stock_movements WHERE product_id = ? ORDER BY occurred_at ASC").all(productId)
        : this.db
            .prepare("SELECT * FROM stock_movements WHERE product_id = ? AND location_id = ? ORDER BY occurred_at ASC")
            .all(productId, locationId)
    ) as unknown as Row[];

    return rows.map(toMovement);
  }

  async findByOriginReference(originReferenceId: string): Promise<readonly StockMovement[]> {
    const rows = this.db
      .prepare("SELECT * FROM stock_movements WHERE origin_reference_id = ? ORDER BY occurred_at ASC")
      .all(originReferenceId) as unknown as Row[];

    return rows.map(toMovement);
  }
}

function toMovement(row: Row): StockMovement {
  return {
    movementId: row.movement_id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    variantId: orUndefined(row.variant_id),
    locationId: orUndefined(row.location_id),
    quantityDelta: row.quantity_delta,
    origin: row.origin as MovementOrigin,
    originReferenceId: orUndefined(row.origin_reference_id),
    occurredAt: fromMs(row.occurred_at),
  };
}
