import type {
  PurchaseRequisition,
  PurchaseRequisitionLine,
  PurchaseRequisitionOrigin,
  PurchaseRequisitionRepository,
  PurchaseRequisitionStatus,
} from "@abp/purchase-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface PurchaseRequisitionRow {
  requisition_id: string;
  tenant_id: string;
  origin: string;
  status: string;
  purchase_order_id: string | null;
  created_at: number;
  updated_at: number;
}

interface PurchaseRequisitionLineRow {
  line_id: number;
  requisition_id: string;
  product_id: string;
  suggested_quantity: number;
}

/**
 * Implementação real de `PurchaseRequisitionRepository`. `PurchaseRequisition.lines` (parte interna
 * do Aggregate, per `PURCHASE_HUB.md`, Capítulo 4) é persistido em `purchase_requisition_lines`,
 * tabela filha sem Repository Interface própria. Diferente de `SqlitePurchaseOrderRepository`,
 * `update` nunca regrava `lines` — nenhum método de `PurchaseRequisitionService` (Core, IMP-301)
 * altera `.lines` após a criação (`approve`/`reject`/`convertToPurchaseOrder` só tocam
 * `status`/`purchaseOrderId`/`updatedAt`) — regravar as linhas em todo `update` seria trabalho sem
 * efeito observável, decisão registrada em `IMP_302_PURCHASE_PERSISTENCE_REPORT.md`.
 */
export class SqlitePurchaseRequisitionRepository implements PurchaseRequisitionRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(requisition: PurchaseRequisition): Promise<PurchaseRequisition> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(
          "INSERT INTO purchase_requisitions (requisition_id, tenant_id, origin, status, purchase_order_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          requisition.requisitionId,
          requisition.tenantId,
          requisition.origin,
          requisition.status,
          orNull(requisition.purchaseOrderId),
          toMs(requisition.createdAt),
          toMs(requisition.updatedAt),
        );

      const insertLine = this.db.prepare(
        "INSERT INTO purchase_requisition_lines (requisition_id, product_id, suggested_quantity) VALUES (?, ?, ?)",
      );
      for (const line of requisition.lines) {
        insertLine.run(requisition.requisitionId, line.productId, line.suggestedQuantity);
      }

      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return requisition;
  }

  async update(requisition: PurchaseRequisition): Promise<PurchaseRequisition> {
    this.db
      .prepare(
        "UPDATE purchase_requisitions SET tenant_id = ?, origin = ?, status = ?, purchase_order_id = ?, created_at = ?, updated_at = ? WHERE requisition_id = ?",
      )
      .run(
        requisition.tenantId,
        requisition.origin,
        requisition.status,
        orNull(requisition.purchaseOrderId),
        toMs(requisition.createdAt),
        toMs(requisition.updatedAt),
        requisition.requisitionId,
      );

    return requisition;
  }

  async findById(requisitionId: string): Promise<PurchaseRequisition | undefined> {
    const row = this.db.prepare("SELECT * FROM purchase_requisitions WHERE requisition_id = ?").get(requisitionId) as unknown as
      | PurchaseRequisitionRow
      | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  async findByStatus(tenantId: string, status: PurchaseRequisitionStatus): Promise<readonly PurchaseRequisition[]> {
    const rows = this.db
      .prepare("SELECT * FROM purchase_requisitions WHERE tenant_id = ? AND status = ?")
      .all(tenantId, status) as unknown as PurchaseRequisitionRow[];
    return rows.map((row) => this.hydrate(row));
  }

  private hydrate(row: PurchaseRequisitionRow): PurchaseRequisition {
    const lineRows = this.db
      .prepare("SELECT * FROM purchase_requisition_lines WHERE requisition_id = ?")
      .all(row.requisition_id) as unknown as PurchaseRequisitionLineRow[];

    return {
      requisitionId: row.requisition_id,
      tenantId: row.tenant_id,
      origin: row.origin as PurchaseRequisitionOrigin,
      lines: lineRows.map(toLine),
      status: row.status as PurchaseRequisitionStatus,
      purchaseOrderId: orUndefined(row.purchase_order_id),
      createdAt: fromMs(row.created_at),
      updatedAt: fromMs(row.updated_at),
    };
  }
}

function toLine(row: PurchaseRequisitionLineRow): PurchaseRequisitionLine {
  return { productId: row.product_id, suggestedQuantity: row.suggested_quantity };
}
