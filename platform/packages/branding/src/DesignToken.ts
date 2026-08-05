/**
 * Design Token — "a unidade atômica e nomeada de identidade visual, e a única forma pela qual
 * qualquer decisão de marca é expressa dentro da plataforma" (`BRANDING_HUB.md`, Capítulo 9;
 * ADR-002: "Nenhuma decisão de identidade é embutida diretamente em um Componente ou Template").
 * `name` é sempre um nome funcional ("cor-destaque-primaria"), nunca o valor bruto sozinho —
 * "Cores são expressas como Tokens nomeados por função, não por valor bruto."
 */
import type { TokenCategory } from "./TokenCategory.js";

export interface DesignToken {
  /** Identificador do Token. */
  readonly tokenId: string;

  /** Tenant ao qual este Token pertence. */
  readonly tenantId: string;

  /** Brand Theme (versão) ao qual este Token pertence. */
  readonly themeId: string;

  /** Categoria do Token. */
  readonly category: TokenCategory;

  /** Nome funcional do Token (ex.: "cor-destaque-primaria"). */
  readonly name: string;

  /** Valor concreto resolvido para este Tenant. */
  readonly value: string;
}
