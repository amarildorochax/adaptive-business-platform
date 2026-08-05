import type {
  ProductionConsumption,
  ProductionOrder,
  ProductionOrderRepository,
  ProductionOutput,
  ProductionStatus,
} from "@abp/production-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface ProductionOrderRow {
  production_order_id: string;
  tenant_id: string;
  bill_of_materials_id: string;
  planned_output_quantity: number;
  status: string;
  work_center_id: string | null;
  order_id: string | null;
  cancel_reason: string | null;
  started_at: number | null;
  completed_at: number | null;
  created_at: number;
  updated_at: number;
}

interface ProductionConsumptionRow {
  consumption_id: string;
  production_order_id: string;
  input_product_id: string;
  quantity_consumed: number;
  acquisition_cost: number;
  consumed_at: number;
}

interface ProductionOutputRow {
  output_id: string;
  production_order_id: string;
  output_product_id: string;
  quantity_generated: number;
  generated_at: number;
}

/**
 * `save` é o único método de escrita especificado por `PRODUCTION_HUB.md`, Capítulo 9 — usado tanto
 * para `CreateProductionOrder` quanto para toda transição subsequente (`StartProduction`,
 * `RegisterProductionConsumption`, `RegisterProductionOutput`, `CompleteProduction`,
 * `CancelProduction`), todas via `ProductionExecutionService` (Core, congelado) devolvendo o
 * Aggregate inteiro a cada chamada. Implementado como upsert, mesmo padrão de
 * `SqliteBillOfMaterialsRepository`.
 *
 * `consumptions`/`outputs` são regravados por completo a cada `save` (`DELETE` + `INSERT` em laço) —
 * nunca uma escrita incremental linha-a-linha — porque o Core sempre entrega o array completo já
 * atualizado (`[...existing.consumptions, consumption]`), mesmo padrão de
 * `SqlitePurchaseOrderRepository.replaceItems`. Toda a escrita (linha própria + dois arrays internos)
 * ocorre em uma única transação.
 */
export class SqliteProductionOrderRepository implements ProductionOrderRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(order: ProductionOrder): Promise<ProductionOrder> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(
          `INSERT INTO production_orders (
             production_order_id, tenant_id, bill_of_materials_id, planned_output_quantity, status,
             work_center_id, order_id, cancel_reason, started_at, completed_at, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (production_order_id) DO UPDATE SET
             tenant_id = excluded.tenant_id,
             bill_of_materials_id = excluded.bill_of_materials_id,
             planned_output_quantity = excluded.planned_output_quantity,
             status = excluded.status,
             work_center_id = excluded.work_center_id,
             order_id = excluded.order_id,
             cancel_reason = excluded.cancel_reason,
             started_at = excluded.started_at,
             completed_at = excluded.completed_at,
             created_at = excluded.created_at,
             updated_at = excluded.updated_at`,
        )
        .run(
          order.productionOrderId,
          order.tenantId,
          order.billOfMaterialsId,
          order.plannedOutputQuantity,
          order.status,
          orNull(order.workCenterId),
          orNull(order.orderId),
          orNull(order.cancelReason),
          toMsOrNull(order.startedAt),
          toMsOrNull(order.completedAt),
          toMs(order.createdAt),
          toMs(order.updatedAt),
        );

      this.replaceConsumptions(order.productionOrderId, order.consumptions);
      this.replaceOutputs(order.productionOrderId, order.outputs);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    return order;
  }

  async findById(productionOrderId: string): Promise<ProductionOrder | undefined> {
    const row = this.db.prepare("SELECT * FROM production_orders WHERE production_order_id = ?").get(productionOrderId) as
      | ProductionOrderRow
      | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  /**
   * LIMITAÇÃO HERDADA DO CORE (documentada): sem `tenantId` — `ProductionOrderRepository` (Core,
   * congelado) especifica a assinatura exatamente assim.
   */
  async findByStatus(status: ProductionStatus): Promise<readonly ProductionOrder[]> {
    const rows = this.db.prepare("SELECT * FROM production_orders WHERE status = ?").all(status) as unknown as ProductionOrderRow[];
    return rows.map((row) => this.hydrate(row));
  }

  async findByOrigin(orderId: string): Promise<readonly ProductionOrder[]> {
    const rows = this.db.prepare("SELECT * FROM production_orders WHERE order_id = ?").all(orderId) as unknown as ProductionOrderRow[];
    return rows.map((row) => this.hydrate(row));
  }

  private replaceConsumptions(productionOrderId: string, consumptions: readonly ProductionConsumption[]): void {
    this.db.prepare("DELETE FROM production_consumptions WHERE production_order_id = ?").run(productionOrderId);

    const insert = this.db.prepare(
      "INSERT INTO production_consumptions (consumption_id, production_order_id, input_product_id, quantity_consumed, acquisition_cost, consumed_at) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const consumption of consumptions) {
      insert.run(
        consumption.consumptionId,
        productionOrderId,
        consumption.inputProductId,
        consumption.quantityConsumed,
        consumption.acquisitionCost,
        toMs(consumption.consumedAt),
      );
    }
  }

  private replaceOutputs(productionOrderId: string, outputs: readonly ProductionOutput[]): void {
    this.db.prepare("DELETE FROM production_outputs WHERE production_order_id = ?").run(productionOrderId);

    const insert = this.db.prepare(
      "INSERT INTO production_outputs (output_id, production_order_id, output_product_id, quantity_generated, generated_at) VALUES (?, ?, ?, ?, ?)",
    );
    for (const output of outputs) {
      insert.run(output.outputId, productionOrderId, output.outputProductId, output.quantityGenerated, toMs(output.generatedAt));
    }
  }

  private hydrate(row: ProductionOrderRow): ProductionOrder {
    const consumptionRows = this.db
      .prepare("SELECT * FROM production_consumptions WHERE production_order_id = ?")
      .all(row.production_order_id) as unknown as ProductionConsumptionRow[];
    const outputRows = this.db
      .prepare("SELECT * FROM production_outputs WHERE production_order_id = ?")
      .all(row.production_order_id) as unknown as ProductionOutputRow[];

    return {
      productionOrderId: row.production_order_id,
      tenantId: row.tenant_id,
      billOfMaterialsId: row.bill_of_materials_id,
      plannedOutputQuantity: row.planned_output_quantity,
      status: row.status as ProductionStatus,
      workCenterId: orUndefined(row.work_center_id),
      orderId: orUndefined(row.order_id),
      consumptions: consumptionRows.map(toConsumption),
      outputs: outputRows.map(toOutput),
      cancelReason: orUndefined(row.cancel_reason),
      startedAt: fromMsOrUndefined(row.started_at),
      completedAt: fromMsOrUndefined(row.completed_at),
      createdAt: fromMs(row.created_at),
      updatedAt: fromMs(row.updated_at),
    };
  }
}

function toConsumption(row: ProductionConsumptionRow): ProductionConsumption {
  return {
    consumptionId: row.consumption_id,
    productionOrderId: row.production_order_id,
    inputProductId: row.input_product_id,
    quantityConsumed: row.quantity_consumed,
    acquisitionCost: row.acquisition_cost,
    consumedAt: fromMs(row.consumed_at),
  };
}

function toOutput(row: ProductionOutputRow): ProductionOutput {
  return {
    outputId: row.output_id,
    productionOrderId: row.production_order_id,
    outputProductId: row.output_product_id,
    quantityGenerated: row.quantity_generated,
    generatedAt: fromMs(row.generated_at),
  };
}
