import type { BusinessProfile } from "./BusinessProfile.js";

/**
 * Business Profile Repository — "Todo Tenant possui exatamente um Business Profile ativo" (ADR-001).
 * A identidade do Perfil é imutável após a Criação — sem `update` nem `remove`; toda mudança de
 * Classificação ou de Maturidade é versionada em seu próprio Repository (ADR-006, ADR-009), nunca
 * neste.
 */
export interface BusinessProfileRepository {
  create(profile: BusinessProfile): Promise<BusinessProfile>;
  findByTenantId(tenantId: string): Promise<BusinessProfile | undefined>;
}
