import type { BusinessProfile } from "./BusinessProfile.js";
import type { BusinessProfileRepository } from "./BusinessProfileRepository.js";

/**
 * Business Profile Service — a fração de armazenamento do "Profile Manager" (`BUSINESS_PROFILE_ENGINE.md`,
 * Capítulo 7): "Toda leitura e toda escrita de perfil passam por ele... garante que o perfil resultante
 * seja internamente consistente." Aplica ADR-001 estruturalmente: `create` nunca produz um segundo
 * Business Profile ativo para o mesmo Tenant.
 */
export class BusinessProfileService {
  constructor(private readonly repository: BusinessProfileRepository) {}

  async create(tenantId: string): Promise<BusinessProfile> {
    const existing = await this.repository.findByTenantId(tenantId);
    if (existing) {
      throw new Error(`Tenant "${tenantId}" já possui um Business Profile ativo (ADR-001).`);
    }

    const profile: BusinessProfile = { profileId: crypto.randomUUID(), tenantId, createdAt: new Date() };
    return this.repository.create(profile);
  }

  async findByTenantId(tenantId: string): Promise<BusinessProfile | undefined> {
    return this.repository.findByTenantId(tenantId);
  }
}
