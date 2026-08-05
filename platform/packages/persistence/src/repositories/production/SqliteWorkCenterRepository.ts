import type { WorkCenter, WorkCenterRepository } from "@abp/production-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromBoolInt, fromMs, orNull, orUndefined, toBoolInt, toMs } from "../../db/sqlUtil.js";

interface Row {
  work_center_id: string;
  tenant_id: string;
  name: string;
  nominal_capacity: number | null;
  active: number;
  created_at: number;
}

/**
 * Tabela única, sem entidade filha — mesma disciplina de `SqliteReorderRuleRepository` (IMP-302):
 * nenhuma transação explícita é necessária (`INSERT`/upsert de uma única linha já é atômico).
 */
export class SqliteWorkCenterRepository implements WorkCenterRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(workCenter: WorkCenter): Promise<WorkCenter> {
    this.db
      .prepare(
        `INSERT INTO work_centers (work_center_id, tenant_id, name, nominal_capacity, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (work_center_id) DO UPDATE SET
           tenant_id = excluded.tenant_id,
           name = excluded.name,
           nominal_capacity = excluded.nominal_capacity,
           active = excluded.active,
           created_at = excluded.created_at`,
      )
      .run(
        workCenter.workCenterId,
        workCenter.tenantId,
        workCenter.name,
        orNull(workCenter.nominalCapacity),
        toBoolInt(workCenter.active),
        toMs(workCenter.createdAt),
      );
    return workCenter;
  }

  /**
   * LIMITAÇÃO HERDADA DO CORE (documentada): `findActive` não recebe `tenantId` —
   * `WorkCenterRepository` (Core, congelado) especifica a assinatura exatamente assim
   * (`PRODUCTION_HUB.md`, Capítulo 9). Implementado literalmente, nunca com um parâmetro adicional.
   */
  async findActive(): Promise<readonly WorkCenter[]> {
    const rows = this.db.prepare("SELECT * FROM work_centers WHERE active = 1").all() as unknown as Row[];
    return rows.map(toWorkCenter);
  }
}

function toWorkCenter(row: Row): WorkCenter {
  return {
    workCenterId: row.work_center_id,
    tenantId: row.tenant_id,
    name: row.name,
    nominalCapacity: orUndefined(row.nominal_capacity),
    active: fromBoolInt(row.active),
    createdAt: fromMs(row.created_at),
  };
}
