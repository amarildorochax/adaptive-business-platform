import type { BillOfMaterials, BillOfMaterialsRepository, BillOfMaterialsStatus, BOMLine, UnitOfMeasure } from "@abp/production-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface BillOfMaterialsRow {
  bill_of_materials_id: string;
  tenant_id: string;
  output_product_id: string;
  version: number;
  status: string;
  created_at: number;
  superseded_at: number | null;
}

interface BOMLineRow {
  line_id: number;
  bill_of_materials_id: string;
  input_product_id: string;
  variant_id: string | null;
  quantity_per_output_unit: number;
  unit_of_measure: string;
}

/**
 * `save` é o único método de escrita especificado por `PRODUCTION_HUB.md`, Capítulo 9 — usado tanto
 * para inserir a primeira versão (`CreateBillOfMaterials`) quanto para persistir a transição
 * `Active → Superseded` da versão corrente e a inserção da versão seguinte
 * (`BillOfMaterialsService.supersede`, Core, congelado). Implementado aqui como upsert
 * (`INSERT ... ON CONFLICT DO UPDATE`), nunca um `create`/`update` separados que o Repository
 * Interface não define — mesma disciplina de nunca inventar método além do contrato aprovado.
 *
 * Toda escrita de `BillOfMaterials` (linha própria + `bom_lines`) ocorre em uma única transação —
 * "toda escrita envolvendo Aggregate + entidades internas deverá ocorrer em transação", mesmo padrão
 * de `SqliteSupplierRepository`/`SqlitePurchaseOrderRepository`.
 */
export class SqliteBillOfMaterialsRepository implements BillOfMaterialsRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(bom: BillOfMaterials): Promise<BillOfMaterials> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(
          `INSERT INTO bills_of_materials (bill_of_materials_id, tenant_id, output_product_id, version, status, created_at, superseded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (bill_of_materials_id) DO UPDATE SET
             tenant_id = excluded.tenant_id,
             output_product_id = excluded.output_product_id,
             version = excluded.version,
             status = excluded.status,
             created_at = excluded.created_at,
             superseded_at = excluded.superseded_at`,
        )
        .run(
          bom.billOfMaterialsId,
          bom.tenantId,
          bom.outputProductId,
          bom.version,
          bom.status,
          toMs(bom.createdAt),
          toMsOrNull(bom.supersededAt),
        );

      this.replaceLines(bom.billOfMaterialsId, bom.lines);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    return bom;
  }

  async findById(billOfMaterialsId: string): Promise<BillOfMaterials | undefined> {
    const row = this.db.prepare("SELECT * FROM bills_of_materials WHERE bill_of_materials_id = ?").get(billOfMaterialsId) as
      | BillOfMaterialsRow
      | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  /**
   * LIMITAÇÃO HERDADA DO CORE (documentada, nunca corrigida silenciosamente): `findActiveByProduct`
   * recebe apenas `outputProductId`, sem `tenantId` — `BillOfMaterialsRepository` (Core, congelado
   * nesta Sprint) especifica a assinatura exatamente assim (`PRODUCTION_HUB.md`, Capítulo 9). Consulta
   * implementada exatamente como especificado, nunca com um parâmetro adicional não previsto pelo
   * contrato — mesma disciplina já aplicada por `SqliteStockMovementRepository.findByProduct` (IMP-402).
   */
  async findActiveByProduct(outputProductId: string): Promise<BillOfMaterials | undefined> {
    const row = this.db
      .prepare("SELECT * FROM bills_of_materials WHERE output_product_id = ? AND status = 'Active'")
      .get(outputProductId) as BillOfMaterialsRow | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  private replaceLines(billOfMaterialsId: string, lines: readonly BOMLine[]): void {
    this.db.prepare("DELETE FROM bom_lines WHERE bill_of_materials_id = ?").run(billOfMaterialsId);

    const insert = this.db.prepare(
      "INSERT INTO bom_lines (bill_of_materials_id, input_product_id, variant_id, quantity_per_output_unit, unit_of_measure) VALUES (?, ?, ?, ?, ?)",
    );
    for (const line of lines) {
      insert.run(billOfMaterialsId, line.inputProductId, orNull(line.variantId), line.quantityPerOutputUnit, line.unitOfMeasure);
    }
  }

  private hydrate(row: BillOfMaterialsRow): BillOfMaterials {
    const lineRows = this.db
      .prepare("SELECT * FROM bom_lines WHERE bill_of_materials_id = ?")
      .all(row.bill_of_materials_id) as unknown as BOMLineRow[];

    return {
      billOfMaterialsId: row.bill_of_materials_id,
      tenantId: row.tenant_id,
      outputProductId: row.output_product_id,
      version: row.version,
      lines: lineRows.map(toLine),
      status: row.status as BillOfMaterialsStatus,
      createdAt: fromMs(row.created_at),
      supersededAt: fromMsOrUndefined(row.superseded_at),
    };
  }
}

function toLine(row: BOMLineRow): BOMLine {
  return {
    inputProductId: row.input_product_id,
    variantId: orUndefined(row.variant_id),
    quantityPerOutputUnit: row.quantity_per_output_unit,
    unitOfMeasure: row.unit_of_measure as UnitOfMeasure,
  };
}
