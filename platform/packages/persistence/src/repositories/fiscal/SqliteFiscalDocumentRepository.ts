import type { FiscalDocument, FiscalDocumentLine, FiscalDocumentRepository, FiscalDocumentStatus, FiscalDocumentType } from "@abp/fiscal-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface DocumentRow {
  fiscal_document_id: string;
  tenant_id: string;
  type: string;
  order_id: string | null;
  invoice_id: string | null;
  status: string;
  number: string | null;
  series: string | null;
  cancel_reason: string | null;
  issued_at: number;
  cancelled_at: number | null;
  created_at: number;
  updated_at: number;
}

interface LineRow {
  fiscal_document_line_id: string;
  fiscal_document_id: string;
  product_id: string;
  quantity: number;
  unit_value_amount: number;
  unit_value_currency_code: string;
  classification_code: string;
  tax_calculation_id: string;
  tax_rule_id: string;
  tax_amount_amount: number;
  tax_amount_currency_code: string;
  tax_calculated_at: number;
}

/**
 * `save` é o único método de escrita especificado por `FISCAL_HUB.md`, Capítulo 9 — usado tanto para
 * `IssueFiscalDocument` quanto para `CancelFiscalDocument`
 * (`FiscalDocumentIssuanceService`, Core, congelado), sempre devolvendo o Aggregate inteiro.
 * Implementado como upsert, mesmo padrão de `SqliteProductionOrderRepository`.
 *
 * `lines` são regravadas por completo a cada `save` (`DELETE` + `INSERT` em laço) — nunca uma escrita
 * incremental linha-a-linha — porque o Core sempre entrega o array completo já montado, mesmo padrão
 * de `SqliteBillOfMaterialsRepository.replaceLines`. Toda a escrita (linha própria + `lines`) ocorre em
 * uma única transação. `TaxCalculation`, achatado dentro de `fiscal_document_lines` (ver migration),
 * nunca ganha uma tabela ou transação própria.
 */
export class SqliteFiscalDocumentRepository implements FiscalDocumentRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(document: FiscalDocument): Promise<FiscalDocument> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(
          `INSERT INTO fiscal_documents (
             fiscal_document_id, tenant_id, type, order_id, invoice_id, status, number, series,
             cancel_reason, issued_at, cancelled_at, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (fiscal_document_id) DO UPDATE SET
             tenant_id = excluded.tenant_id,
             type = excluded.type,
             order_id = excluded.order_id,
             invoice_id = excluded.invoice_id,
             status = excluded.status,
             number = excluded.number,
             series = excluded.series,
             cancel_reason = excluded.cancel_reason,
             issued_at = excluded.issued_at,
             cancelled_at = excluded.cancelled_at,
             created_at = excluded.created_at,
             updated_at = excluded.updated_at`,
        )
        .run(
          document.fiscalDocumentId,
          document.tenantId,
          document.type,
          orNull(document.orderId),
          orNull(document.invoiceId),
          document.status,
          orNull(document.number),
          orNull(document.series),
          orNull(document.cancelReason),
          toMs(document.issuedAt),
          toMsOrNull(document.cancelledAt),
          toMs(document.createdAt),
          toMs(document.updatedAt),
        );

      this.replaceLines(document.fiscalDocumentId, document.lines);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    return document;
  }

  async findById(fiscalDocumentId: string): Promise<FiscalDocument | undefined> {
    const row = this.db.prepare("SELECT * FROM fiscal_documents WHERE fiscal_document_id = ?").get(fiscalDocumentId) as
      | DocumentRow
      | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  async findByOrigin(orderId: string): Promise<readonly FiscalDocument[]> {
    const rows = this.db.prepare("SELECT * FROM fiscal_documents WHERE order_id = ?").all(orderId) as unknown as DocumentRow[];
    return rows.map((row) => this.hydrate(row));
  }

  private replaceLines(fiscalDocumentId: string, lines: readonly FiscalDocumentLine[]): void {
    this.db.prepare("DELETE FROM fiscal_document_lines WHERE fiscal_document_id = ?").run(fiscalDocumentId);

    const insert = this.db.prepare(
      `INSERT INTO fiscal_document_lines (
         fiscal_document_line_id, fiscal_document_id, product_id, quantity, unit_value_amount,
         unit_value_currency_code, classification_code, tax_calculation_id, tax_rule_id,
         tax_amount_amount, tax_amount_currency_code, tax_calculated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const line of lines) {
      insert.run(
        line.fiscalDocumentLineId,
        fiscalDocumentId,
        line.productId,
        line.quantity,
        line.unitValue.amount,
        line.unitValue.currencyCode,
        line.classification.code,
        line.taxCalculation.taxCalculationId,
        line.taxCalculation.taxRuleId,
        line.taxCalculation.amount.amount,
        line.taxCalculation.amount.currencyCode,
        toMs(line.taxCalculation.calculatedAt),
      );
    }
  }

  private hydrate(row: DocumentRow): FiscalDocument {
    const lineRows = this.db
      .prepare("SELECT * FROM fiscal_document_lines WHERE fiscal_document_id = ?")
      .all(row.fiscal_document_id) as unknown as LineRow[];

    return {
      fiscalDocumentId: row.fiscal_document_id,
      tenantId: row.tenant_id,
      type: row.type as FiscalDocumentType,
      orderId: orUndefined(row.order_id),
      invoiceId: orUndefined(row.invoice_id),
      lines: lineRows.map(toLine),
      status: row.status as FiscalDocumentStatus,
      number: orUndefined(row.number),
      series: orUndefined(row.series),
      cancelReason: orUndefined(row.cancel_reason),
      issuedAt: fromMs(row.issued_at),
      cancelledAt: fromMsOrUndefined(row.cancelled_at),
      createdAt: fromMs(row.created_at),
      updatedAt: fromMs(row.updated_at),
    };
  }
}

function toLine(row: LineRow): FiscalDocumentLine {
  return {
    fiscalDocumentLineId: row.fiscal_document_line_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitValue: { amount: row.unit_value_amount, currencyCode: row.unit_value_currency_code },
    classification: { code: row.classification_code },
    taxCalculation: {
      taxCalculationId: row.tax_calculation_id,
      fiscalDocumentLineId: row.fiscal_document_line_id,
      taxRuleId: row.tax_rule_id,
      amount: { amount: row.tax_amount_amount, currencyCode: row.tax_amount_currency_code },
      calculatedAt: fromMs(row.tax_calculated_at),
    },
  };
}
