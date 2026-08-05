import type { SupplierPerformanceRecord, SupplierPerformanceRepository } from "@abp/supplier-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  record_id: string;
  supplier_id: string;
  tenant_id: string;
  purchase_order_id: string;
  observation_type: string;
  observed_at: number;
}

/** Implementação real de `SupplierPerformanceRepository`. `append`, nunca `update` — todo registro
 * é imutável assim que criado (per `SUPPLIER_HUB.md`, Capítulo 5, e `SupplierPerformanceRepository.ts`,
 * Core). */
export class SqliteSupplierPerformanceRepository implements SupplierPerformanceRepository {
  constructor(private readonly db: DatabaseSync) {}

  async append(record: SupplierPerformanceRecord): Promise<SupplierPerformanceRecord> {
    this.db
      .prepare(
        "INSERT INTO supplier_performance_records (record_id, supplier_id, tenant_id, purchase_order_id, observation_type, observed_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(record.recordId, record.supplierId, record.tenantId, record.purchaseOrderId, record.observationType, toMs(record.observedAt));
    return record;
  }

  async findBySupplier(supplierId: string): Promise<readonly SupplierPerformanceRecord[]> {
    const rows = this.db
      .prepare("SELECT * FROM supplier_performance_records WHERE supplier_id = ?")
      .all(supplierId) as unknown as Row[];
    return rows.map(toRecord);
  }
}

function toRecord(row: Row): SupplierPerformanceRecord {
  return {
    recordId: row.record_id,
    supplierId: row.supplier_id,
    tenantId: row.tenant_id,
    purchaseOrderId: row.purchase_order_id,
    observationType: row.observation_type as SupplierPerformanceRecord["observationType"],
    observedAt: fromMs(row.observed_at),
  };
}
