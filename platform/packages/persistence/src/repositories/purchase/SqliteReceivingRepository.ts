import type { Receiving, ReceivingLine, ReceivingRepository } from "@abp/purchase-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface ReceivingRow {
  receiving_id: string;
  purchase_order_id: string;
  tenant_id: string;
  received_at: number;
}

interface ReceivingLineRow {
  line_id: number;
  receiving_id: string;
  purchase_order_item_id: string;
  quantity_received: number;
}

/**
 * Implementação real de `ReceivingRepository`. `Receiving.lines` (parte interna da Entidade, per
 * `PURCHASE_HUB.md`, Capítulo 4) é persistido em `receiving_lines`, tabela filha sem Repository
 * Interface própria. Diferente de `SqlitePurchaseOrderRepository`, não existe método `update` — cada
 * `Receiving` é imutável assim que criado (per `Receiving.ts`/`ReceivingRepository.ts`, Core) —
 * `create` grava `receivings` e `receiving_lines` em uma única transação, nunca revisitada depois.
 */
export class SqliteReceivingRepository implements ReceivingRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(receiving: Receiving): Promise<Receiving> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare("INSERT INTO receivings (receiving_id, purchase_order_id, tenant_id, received_at) VALUES (?, ?, ?, ?)")
        .run(receiving.receivingId, receiving.purchaseOrderId, receiving.tenantId, toMs(receiving.receivedAt));

      const insertLine = this.db.prepare(
        "INSERT INTO receiving_lines (receiving_id, purchase_order_item_id, quantity_received) VALUES (?, ?, ?)",
      );
      for (const line of receiving.lines) {
        insertLine.run(receiving.receivingId, line.purchaseOrderItemId, line.quantityReceived);
      }

      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return receiving;
  }

  async findByPurchaseOrder(purchaseOrderId: string): Promise<readonly Receiving[]> {
    const rows = this.db
      .prepare("SELECT * FROM receivings WHERE purchase_order_id = ?")
      .all(purchaseOrderId) as unknown as ReceivingRow[];

    return rows.map((row) => this.hydrate(row));
  }

  private hydrate(row: ReceivingRow): Receiving {
    const lineRows = this.db
      .prepare("SELECT * FROM receiving_lines WHERE receiving_id = ?")
      .all(row.receiving_id) as unknown as ReceivingLineRow[];

    return {
      receivingId: row.receiving_id,
      purchaseOrderId: row.purchase_order_id,
      tenantId: row.tenant_id,
      lines: lineRows.map(toLine),
      receivedAt: fromMs(row.received_at),
    };
  }
}

function toLine(row: ReceivingLineRow): ReceivingLine {
  return { purchaseOrderItemId: row.purchase_order_item_id, quantityReceived: row.quantity_received };
}
