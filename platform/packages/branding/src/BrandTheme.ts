/**
 * Brand Theme — "a composição completa e consumível de todos os Design Tokens de uma empresa,
 * produzida pelo Theme Generator" (`BRANDING_HUB.md`, Capítulo 10; Ownership:
 * `DOMAIN_OWNERSHIP_MATRIX.md`, "Brand Theme"). ADR-012: "Regeneração de Theme é sempre completa,
 * nunca incremental sobre o estado anterior" — cada versão é um Theme inteiramente novo e
 * revalidado, nunca um remendo sobre o anterior.
 */
export interface BrandTheme {
  /** Identificador do Theme (também a chave de agrupamento de seus Design Tokens). */
  readonly themeId: string;

  /** Tenant ao qual este Theme pertence. */
  readonly tenantId: string;

  /** Número da versão — ADR-004: "Toda mudança de identidade é versionada, nunca sobrescrita silenciosamente." */
  readonly version: number;

  /** Momento da geração desta versão. */
  readonly generatedAt: Date;
}
