import type { TaxRegime, TaxRegimeRepository } from "@abp/fiscal-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  tax_regime_id: string;
  tenant_id: string;
  name: string;
  created_at: number;
}

/**
 * `save` é o único método de escrita especificado por `FISCAL_HUB.md`, Capítulo 9 — implementado como
 * upsert (`INSERT ... ON CONFLICT DO UPDATE`), mesmo padrão de `SqliteWorkCenterRepository`. Tabela
 * única, sem entidade filha — sem transação explícita, um único `INSERT`/upsert já é atômico.
 *
 * `UNIQUE (tenant_id)` (migration) traduz "associado a exatamente uma Empresa por Tenant"
 * (`FISCAL_HUB.md`, Capítulo 5) a nível de banco — reforço de `FiscalValidator.ensureNoDuplicateTaxRegime`
 * (Core, já verificado antes de qualquer chamada a `save`), nunca uma regra nova.
 */
export class SqliteTaxRegimeRepository implements TaxRegimeRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(regime: TaxRegime): Promise<TaxRegime> {
    this.db
      .prepare(
        `INSERT INTO tax_regimes (tax_regime_id, tenant_id, name, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (tax_regime_id) DO UPDATE SET
           tenant_id = excluded.tenant_id,
           name = excluded.name,
           created_at = excluded.created_at`,
      )
      .run(regime.taxRegimeId, regime.tenantId, regime.name, toMs(regime.createdAt));
    return regime;
  }

  async findByTenant(tenantId: string): Promise<TaxRegime | undefined> {
    const row = this.db.prepare("SELECT * FROM tax_regimes WHERE tenant_id = ?").get(tenantId) as Row | undefined;
    return row ? toRegime(row) : undefined;
  }
}

function toRegime(row: Row): TaxRegime {
  return {
    taxRegimeId: row.tax_regime_id,
    tenantId: row.tenant_id,
    name: row.name,
    createdAt: fromMs(row.created_at),
  };
}
