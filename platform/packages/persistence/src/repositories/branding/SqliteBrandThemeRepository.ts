import type { BrandTheme, BrandThemeRepository } from "@abp/branding";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  theme_id: string;
  tenant_id: string;
  version: number;
  generated_at: number;
}

/** Implementação real de `BrandThemeRepository`. */
export class SqliteBrandThemeRepository implements BrandThemeRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(theme: BrandTheme): Promise<BrandTheme> {
    this.db.prepare("INSERT INTO brand_themes (theme_id, tenant_id, version, generated_at) VALUES (?, ?, ?, ?)").run(theme.themeId, theme.tenantId, theme.version, toMs(theme.generatedAt));
    return theme;
  }

  async listByTenant(tenantId: string): Promise<readonly BrandTheme[]> {
    const rows = this.db.prepare("SELECT theme_id, tenant_id, version, generated_at FROM brand_themes WHERE tenant_id = ? ORDER BY id ASC").all(tenantId) as unknown as Row[];

    return rows.map((row) => ({ themeId: row.theme_id, tenantId: row.tenant_id, version: row.version, generatedAt: fromMs(row.generated_at) }));
  }
}
