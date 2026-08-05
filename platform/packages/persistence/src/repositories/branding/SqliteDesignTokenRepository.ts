import type { DesignToken, DesignTokenRepository, TokenCategory } from "@abp/branding";
import type { DatabaseSync } from "node:sqlite";

interface Row {
  token_id: string;
  tenant_id: string;
  theme_id: string;
  category: string;
  name: string;
  value: string;
}

/** Implementação real de `DesignTokenRepository`. */
export class SqliteDesignTokenRepository implements DesignTokenRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(token: DesignToken): Promise<DesignToken> {
    this.db
      .prepare("INSERT INTO design_tokens (token_id, tenant_id, theme_id, category, name, value) VALUES (?, ?, ?, ?, ?, ?)")
      .run(token.tokenId, token.tenantId, token.themeId, token.category, token.name, token.value);
    return token;
  }

  async listByThemeId(themeId: string): Promise<readonly DesignToken[]> {
    const rows = this.db.prepare("SELECT token_id, tenant_id, theme_id, category, name, value FROM design_tokens WHERE theme_id = ? ORDER BY id ASC").all(themeId) as unknown as Row[];

    return rows.map((row) => ({ tokenId: row.token_id, tenantId: row.tenant_id, themeId: row.theme_id, category: row.category as TokenCategory, name: row.name, value: row.value }));
  }
}
