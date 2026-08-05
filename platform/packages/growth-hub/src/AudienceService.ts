import type { Audience } from './Audience';
import type { AudienceRepository } from './AudienceRepository';

/** Campos aceitos por `AudienceService.build()`. */
export type BuildAudienceInput = Pick<Audience, 'tenantId' | 'memberReferenceIds' | 'estimatedReach'>;

/**
 * AudienceService — `memberReferenceIds` são sempre referências opacas (Blueprint, ADR-002); esta
 * classe nunca importa `Customer` de `@abp/crm-hub` (nenhum Business Hub depende de outro,
 * `PACKAGE_STRUCTURE_MANIFEST.md`). `estimatedReach` adaptado de
 * `src/core/campaign/CampaignAudience.ts` (Campaign Management legado). Nenhuma emissão de Evento
 * aqui — responsabilidade exclusiva de GrowthManager.
 */
export class AudienceService {
  constructor(private readonly repository: AudienceRepository) {}

  async build(input: BuildAudienceInput): Promise<Audience> {
    const audience: Audience = {
      audienceId: crypto.randomUUID(),
      builtAt: new Date(),
      ...input,
    };

    return this.repository.create(audience);
  }

  async get(audienceId: string): Promise<Audience | undefined> {
    return this.repository.get(audienceId);
  }

  async list(tenantId: string): Promise<readonly Audience[]> {
    return this.repository.list(tenantId);
  }
}
