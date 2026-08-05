import type { StockLocation, StockLocationRepository } from "@abp/inventory-movement-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromBoolInt, fromMs, orNull, toBoolInt, toMs } from "../../db/sqlUtil.js";

interface Row {
  location_id: string;
  tenant_id: string;
  name: string;
  address_line: string | null;
  active: number;
  created_at: number;
}

/**
 * Implementação real de `StockLocationRepository`. Sem `update` — a interface (Core, congelada nesta
 * Sprint) expõe apenas `create`/`findById`/`findAllActive`, nenhum Command de alteração para
 * `StockLocation` existe em `INVENTORY_MOVEMENT_HUB.md`, Capítulo 7. `address_line` achata
 * `StockLocationAddress` (`{line: string}`), mesmo critério de achatamento de Value Object de campo
 * único já aplicado a `TaxId` (IMP-202).
 */
export class SqliteStockLocationRepository implements StockLocationRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(location: StockLocation): Promise<StockLocation> {
    this.db
      .prepare("INSERT INTO stock_locations (location_id, tenant_id, name, address_line, active, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(
        location.locationId,
        location.tenantId,
        location.name,
        orNull(location.address?.line),
        toBoolInt(location.active),
        toMs(location.createdAt),
      );
    return location;
  }

  async findById(locationId: string): Promise<StockLocation | undefined> {
    const row = this.db.prepare("SELECT * FROM stock_locations WHERE location_id = ?").get(locationId) as unknown as Row | undefined;
    return row ? toLocation(row) : undefined;
  }

  async findAllActive(tenantId: string): Promise<readonly StockLocation[]> {
    const rows = this.db
      .prepare("SELECT * FROM stock_locations WHERE tenant_id = ? AND active = 1")
      .all(tenantId) as unknown as Row[];
    return rows.map(toLocation);
  }
}

function toLocation(row: Row): StockLocation {
  return {
    locationId: row.location_id,
    tenantId: row.tenant_id,
    name: row.name,
    address: row.address_line === null ? undefined : { line: row.address_line },
    active: fromBoolInt(row.active),
    createdAt: fromMs(row.created_at),
  };
}
