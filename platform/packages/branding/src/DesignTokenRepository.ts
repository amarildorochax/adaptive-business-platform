import type { DesignToken } from "./DesignToken.js";

/** Design Token Repository — cada Token é um fato imutável associado a uma versão de Theme; nunca `update` nem `remove` (ADR-012: regeneração é sempre completa, nunca incremental). */
export interface DesignTokenRepository {
  create(token: DesignToken): Promise<DesignToken>;
  listByThemeId(themeId: string): Promise<readonly DesignToken[]>;
}
