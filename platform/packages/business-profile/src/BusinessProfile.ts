/**
 * Business Profile — "entendimento estruturado e vivo de uma Empresa, mantido pelo Business Profile
 * Engine" (`BUSINESS_PROFILE_ENGINE.md`, Glossário; Ownership: `DOMAIN_OWNERSHIP_MATRIX.md`, "Business
 * Profile"). ADR-001: "Todo Tenant possui exatamente um Business Profile ativo" — aplicado
 * estruturalmente por `BusinessProfileService.create`, nunca apenas documentado.
 *
 * Carrega somente a identidade do Perfil — Segmento/Subsegmento (`BusinessClassification`) e
 * Maturidade evoluem de forma independente e versionada (ADR-006, Composable Profile; ADR-009,
 * Profile Versioning), nunca como campo mutável deste registro, mesma disciplina estrutural já
 * aplicada a `KnowledgeAsset` (imutável) + `KnowledgeVersion` (versionado) na IMP-015.
 */
export interface BusinessProfile {
  /** Identificador do Business Profile. */
  readonly profileId: string;

  /** Tenant ao qual este Perfil pertence — exatamente um Business Profile ativo por Tenant (ADR-001). */
  readonly tenantId: string;

  /** Momento de criação — início da Jornada de Construção do Perfil (Capítulo 9). */
  readonly createdAt: Date;
}
