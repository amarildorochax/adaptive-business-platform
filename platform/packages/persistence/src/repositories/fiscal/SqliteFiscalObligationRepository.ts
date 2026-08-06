import type { FiscalObligation, FiscalObligationRepository, FiscalObligationStatus } from "@abp/fiscal-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface Row {
  fiscal_obligation_id: string;
  tenant_id: string;
  type: string;
  periodicity: string;
  due_date: number;
  status: string;
  fulfilled_at: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * `save` é o único método de escrita especificado por `FISCAL_HUB.md`, Capítulo 9 — usado tanto para
 * `RegisterFiscalObligation` quanto para `MarkFiscalObligationFulfilled` e para a transição periódica
 * para `Overdue` (`FiscalObligationTrackingService`, Core, congelado). Tabela única, sem entidade
 * filha — sem transação explícita, mesmo critério de `SqliteReorderRuleRepository`/
 * `SqliteWorkCenterRepository`.
 */
export class SqliteFiscalObligationRepository implements FiscalObligationRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(obligation: FiscalObligation): Promise<FiscalObligation> {
    this.db
      .prepare(
        `INSERT INTO fiscal_obligations (
           fiscal_obligation_id, tenant_id, type, periodicity, due_date, status, fulfilled_at,
           created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (fiscal_obligation_id) DO UPDATE SET
           tenant_id = excluded.tenant_id,
           type = excluded.type,
           periodicity = excluded.periodicity,
           due_date = excluded.due_date,
           status = excluded.status,
           fulfilled_at = excluded.fulfilled_at,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at`,
      )
      .run(
        obligation.fiscalObligationId,
        obligation.tenantId,
        obligation.type,
        obligation.periodicity,
        toMs(obligation.dueDate),
        obligation.status,
        toMsOrNull(obligation.fulfilledAt),
        toMs(obligation.createdAt),
        toMs(obligation.updatedAt),
      );
    return obligation;
  }

  async findById(fiscalObligationId: string): Promise<FiscalObligation | undefined> {
    const row = this.db.prepare("SELECT * FROM fiscal_obligations WHERE fiscal_obligation_id = ?").get(fiscalObligationId) as
      | Row
      | undefined;
    return row ? toObligation(row) : undefined;
  }

  async findPending(): Promise<readonly FiscalObligation[]> {
    const rows = this.db.prepare("SELECT * FROM fiscal_obligations WHERE status = 'Pending'").all() as unknown as Row[];
    return rows.map(toObligation);
  }

  async findOverdue(): Promise<readonly FiscalObligation[]> {
    const rows = this.db.prepare("SELECT * FROM fiscal_obligations WHERE status = 'Overdue'").all() as unknown as Row[];
    return rows.map(toObligation);
  }
}

function toObligation(row: Row): FiscalObligation {
  return {
    fiscalObligationId: row.fiscal_obligation_id,
    tenantId: row.tenant_id,
    type: row.type,
    periodicity: row.periodicity,
    dueDate: fromMs(row.due_date),
    status: row.status as FiscalObligationStatus,
    fulfilledAt: fromMsOrUndefined(row.fulfilled_at),
    createdAt: fromMs(row.created_at),
    updatedAt: fromMs(row.updated_at),
  };
}
