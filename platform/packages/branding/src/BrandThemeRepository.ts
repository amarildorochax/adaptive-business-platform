import type { BrandTheme } from "./BrandTheme.js";

/** Brand Theme Repository — "Toda mudança de identidade é versionada, nunca sobrescrita silenciosamente" (ADR-004); cada versão é um fato imutável, nunca `update` nem `remove`. */
export interface BrandThemeRepository {
  create(theme: BrandTheme): Promise<BrandTheme>;
  listByTenant(tenantId: string): Promise<readonly BrandTheme[]>;
}
