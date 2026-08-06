import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemStatus,
  PurchaseOrderRepository,
  PurchaseStatus,
} from "@abp/purchase-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface PurchaseOrderRow {
  purchase_order_id: string;
  tenant_id: string;
  supplier_id: string;
  requisition_id: string | null;
  status: string;
  approved_by_identity_id: string | null;
  created_at: number;
  updated_at: number;
}

interface PurchaseOrderItemRow {
  purchase_order_item_id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  acquisition_cost_amount: number;
  acquisition_cost_currency_code: string;
  status: string;
}

/** Mesma quantidade de estados "abertos" já definida em `packages/purchase-hub/src/testing/InMemoryFakes.ts` — nunca reinterpretada aqui. */
const OPEN_STATUSES: readonly PurchaseStatus[] = ["Draft", "PendingApproval", "Approved", "Sent", "PartiallyReceived"];

/**
 * Implementação real de `PurchaseOrderRepository`. `PurchaseOrder.items` (parte interna do
 * Aggregate, per `PURCHASE_HUB.md`, Capítulo 4) é persistido em `purchase_order_items`, uma tabela
 * filha sem Repository Interface própria — `create`/`update` sincronizam a lista inteira de itens
 * dentro da mesma transação que grava o Purchase Order, nunca em duas operações independentes,
 * mesmo padrão de `SqliteSupplierRepository`/`supplier_contacts` (IMP-202). Diferente daquela tabela,
 * `replaceItems` faz `diff` seletivo (UPDATE/INSERT/DELETE) em vez de `DELETE`-completo-e-reinserção
 * — `purchase_order_items` é referenciada por FOREIGN KEY de `receiving_lines`, ver BUG-001.
 */
export class SqlitePurchaseOrderRepository implements PurchaseOrderRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    this.db.exec("BEGIN");
    try {
      this.insertPurchaseOrder(purchaseOrder);
      this.replaceItems(purchaseOrder.purchaseOrderId, purchaseOrder.items);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return purchaseOrder;
  }

  async update(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(
          "UPDATE purchase_orders SET tenant_id = ?, supplier_id = ?, requisition_id = ?, status = ?, approved_by_identity_id = ?, created_at = ?, updated_at = ? WHERE purchase_order_id = ?",
        )
        .run(
          purchaseOrder.tenantId,
          purchaseOrder.supplierId,
          orNull(purchaseOrder.requisitionId),
          purchaseOrder.status,
          orNull(purchaseOrder.approvedByIdentityId),
          toMs(purchaseOrder.createdAt),
          toMs(purchaseOrder.updatedAt),
          purchaseOrder.purchaseOrderId,
        );
      this.replaceItems(purchaseOrder.purchaseOrderId, purchaseOrder.items);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return purchaseOrder;
  }

  async findById(purchaseOrderId: string): Promise<PurchaseOrder | undefined> {
    const row = this.db.prepare("SELECT * FROM purchase_orders WHERE purchase_order_id = ?").get(purchaseOrderId) as unknown as
      | PurchaseOrderRow
      | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  async findBySupplier(supplierId: string): Promise<readonly PurchaseOrder[]> {
    const rows = this.db.prepare("SELECT * FROM purchase_orders WHERE supplier_id = ?").all(supplierId) as unknown as PurchaseOrderRow[];
    return rows.map((row) => this.hydrate(row));
  }

  async findByStatus(tenantId: string, status: PurchaseStatus): Promise<readonly PurchaseOrder[]> {
    const rows = this.db
      .prepare("SELECT * FROM purchase_orders WHERE tenant_id = ? AND status = ?")
      .all(tenantId, status) as unknown as PurchaseOrderRow[];
    return rows.map((row) => this.hydrate(row));
  }

  async findOpen(tenantId: string): Promise<readonly PurchaseOrder[]> {
    const placeholders = OPEN_STATUSES.map(() => "?").join(", ");
    const rows = this.db
      .prepare(`SELECT * FROM purchase_orders WHERE tenant_id = ? AND status IN (${placeholders})`)
      .all(tenantId, ...OPEN_STATUSES) as unknown as PurchaseOrderRow[];
    return rows.map((row) => this.hydrate(row));
  }

  private insertPurchaseOrder(purchaseOrder: PurchaseOrder): void {
    this.db
      .prepare(
        "INSERT INTO purchase_orders (purchase_order_id, tenant_id, supplier_id, requisition_id, status, approved_by_identity_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        purchaseOrder.purchaseOrderId,
        purchaseOrder.tenantId,
        purchaseOrder.supplierId,
        orNull(purchaseOrder.requisitionId),
        purchaseOrder.status,
        orNull(purchaseOrder.approvedByIdentityId),
        toMs(purchaseOrder.createdAt),
        toMs(purchaseOrder.updatedAt),
      );
  }

  /**
   * BUG-001 (corrigido) — regravava `purchase_order_items` por completo (`DELETE` + `INSERT`),
   * mesmo padrão de `SqliteSupplierRepository.replaceContacts` (IMP-202). Diferente de
   * `supplier_contacts` (nunca referenciada por FOREIGN KEY de nenhuma outra tabela),
   * `purchase_order_items` É referenciada por `receiving_lines.purchase_order_item_id` — a partir do
   * segundo `registerReceiving` contra o mesmo Purchase Order, o `DELETE` violava essa FOREIGN KEY
   * (a Receiving já criada referencia o item), propagando um erro de constraint bruto até HTTP 500.
   * Ver `docs/implementation/BUG_001_REGISTER_RECEIVING_HTTP500.md`.
   *
   * Corrigido para um `diff` seletivo — `UPDATE` para item já existente, `INSERT` apenas para item
   * genuinamente novo, `DELETE` apenas para item genuinamente removido da lista — nunca excluindo
   * uma linha que uma `receiving_lines` ainda referencia. `PurchaseOrderRepository` (Core) não é
   * alterado: a assinatura e o comportamento observável (o Aggregate completo é sempre regravado a
   * partir do estado atual em memória) permanecem idênticos.
   */
  private replaceItems(purchaseOrderId: string, items: readonly PurchaseOrderItem[]): void {
    const existingRows = this.db
      .prepare("SELECT purchase_order_item_id FROM purchase_order_items WHERE purchase_order_id = ?")
      .all(purchaseOrderId) as unknown as { purchase_order_item_id: string }[];
    const existingIds = new Set(existingRows.map((row) => row.purchase_order_item_id));
    const nextIds = new Set(items.map((item) => item.purchaseOrderItemId));

    const staleIds = [...existingIds].filter((id) => !nextIds.has(id));
    if (staleIds.length > 0) {
      const del = this.db.prepare("DELETE FROM purchase_order_items WHERE purchase_order_item_id = ?");
      for (const id of staleIds) {
        del.run(id);
      }
    }

    const insert = this.db.prepare(
      "INSERT INTO purchase_order_items (purchase_order_item_id, purchase_order_id, product_id, quantity_ordered, quantity_received, acquisition_cost_amount, acquisition_cost_currency_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const update = this.db.prepare(
      "UPDATE purchase_order_items SET product_id = ?, quantity_ordered = ?, quantity_received = ?, acquisition_cost_amount = ?, acquisition_cost_currency_code = ?, status = ? WHERE purchase_order_item_id = ?",
    );

    for (const item of items) {
      if (existingIds.has(item.purchaseOrderItemId)) {
        update.run(
          item.productId,
          item.quantityOrdered,
          item.quantityReceived,
          item.acquisitionCost.amount,
          item.acquisitionCost.currencyCode,
          item.status,
          item.purchaseOrderItemId,
        );
      } else {
        insert.run(
          item.purchaseOrderItemId,
          purchaseOrderId,
          item.productId,
          item.quantityOrdered,
          item.quantityReceived,
          item.acquisitionCost.amount,
          item.acquisitionCost.currencyCode,
          item.status,
        );
      }
    }
  }

  private hydrate(row: PurchaseOrderRow): PurchaseOrder {
    const itemRows = this.db
      .prepare("SELECT * FROM purchase_order_items WHERE purchase_order_id = ?")
      .all(row.purchase_order_id) as unknown as PurchaseOrderItemRow[];

    return {
      purchaseOrderId: row.purchase_order_id,
      tenantId: row.tenant_id,
      supplierId: row.supplier_id,
      requisitionId: orUndefined(row.requisition_id),
      status: row.status as PurchaseStatus,
      items: itemRows.map(toItem),
      approvedByIdentityId: orUndefined(row.approved_by_identity_id),
      createdAt: fromMs(row.created_at),
      updatedAt: fromMs(row.updated_at),
    };
  }
}

function toItem(row: PurchaseOrderItemRow): PurchaseOrderItem {
  return {
    purchaseOrderItemId: row.purchase_order_item_id,
    purchaseOrderId: row.purchase_order_id,
    productId: row.product_id,
    quantityOrdered: row.quantity_ordered,
    quantityReceived: row.quantity_received,
    acquisitionCost: { amount: row.acquisition_cost_amount, currencyCode: row.acquisition_cost_currency_code },
    status: row.status as PurchaseOrderItemStatus,
  };
}
