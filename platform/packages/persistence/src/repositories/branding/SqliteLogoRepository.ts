import type { Logo, LogoRepository } from "@abp/branding";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  logo_id: string;
  tenant_id: string;
  asset_reference: string;
  uploaded_at: number;
}

/** Implementação real de `LogoRepository`. */
export class SqliteLogoRepository implements LogoRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(logo: Logo): Promise<Logo> {
    this.db.prepare("INSERT INTO logos (logo_id, tenant_id, asset_reference, uploaded_at) VALUES (?, ?, ?, ?)").run(logo.logoId, logo.tenantId, logo.assetReference, toMs(logo.uploadedAt));
    return logo;
  }

  async listByTenant(tenantId: string): Promise<readonly Logo[]> {
    const rows = this.db.prepare("SELECT logo_id, tenant_id, asset_reference, uploaded_at FROM logos WHERE tenant_id = ? ORDER BY id ASC").all(tenantId) as unknown as Row[];

    return rows.map((row) => ({ logoId: row.logo_id, tenantId: row.tenant_id, assetReference: row.asset_reference, uploadedAt: fromMs(row.uploaded_at) }));
  }
}
