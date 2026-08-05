/**
 * Create Business Profile Payload — conteúdo do Command "CreateBusinessProfile" (`COMMAND_CATALOG.md`:
 * "registrar novo Business Profile de Empresa cliente... Pós-condições: Business Profile persistido
 * com Segmento e Maturidade iniciais"). Restrito aos campos já em escopo curto-prazo do Blueprint
 * (Capítulo 21) — Objetivos (Goals Engine), Canais (Channel Manager) e demais dimensões do Modelo de
 * Perfil (Capítulo 8) permanecem médio/longo prazo, nunca antecipados aqui.
 */
export interface CreateBusinessProfilePayload {
  /** Tenant ao qual este Perfil pertencerá — exatamente um Business Profile ativo por Tenant (ADR-001). */
  readonly tenantId: string;

  /** Segmento declarado ou já sugerido pelo Business Classifier. */
  readonly segment: string;

  /** Subsegmento, quando já conhecido. */
  readonly subsegment?: string;

  /** Maturidade Digital inicial estimada pelo Business Maturity Engine. */
  readonly maturity: string;
}
