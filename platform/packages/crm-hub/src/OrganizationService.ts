import type { Organization } from './Organization';
import type { OrganizationRepository } from './OrganizationRepository';

/** Campos aceitos por `OrganizationService.create()` — nunca inclui `relationshipId`, atribuído por quem orquestra (ver CRMManager). */
export type CreateOrganizationInput = Pick<
  Organization,
  'tenantId' | 'name' | 'tradeName' | 'taxId' | 'segment' | 'phone' | 'email' | 'website'
>;

/**
 * OrganizationService — adaptado de `src/app/features/crm/{types/Company.ts, hooks/useCompanies.ts}`
 * (a implementação mais madura das duas árvores legadas, per SOURCE_TREE_STRATEGY.md, Capítulo 5) e
 * de `src/core/crm/{CustomerService.ts, CustomerStore.ts}` para o padrão Service/Repository — mesma
 * disciplina de responsabilidade única já em uso naquela árvore: nenhuma emissão de Evento aqui,
 * responsabilidade exclusiva de CRMManager.
 */
export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  async create(input: CreateOrganizationInput, relationshipId: string): Promise<Organization> {
    const organization: Organization = {
      organizationId: crypto.randomUUID(),
      relationshipId,
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(organization);
  }

  async update(
    organizationId: string,
    input: Partial<CreateOrganizationInput>,
  ): Promise<Organization> {
    const existing = await this.repository.get(organizationId);

    if (!existing) {
      throw new Error(`Organization ${organizationId} não encontrada.`);
    }

    return this.repository.update({ ...existing, ...input });
  }

  async get(organizationId: string): Promise<Organization | undefined> {
    return this.repository.get(organizationId);
  }

  async list(tenantId: string): Promise<readonly Organization[]> {
    return this.repository.list(tenantId);
  }
}
