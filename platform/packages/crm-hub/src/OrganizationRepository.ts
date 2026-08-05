import type { Organization } from './Organization';

/**
 * OrganizationRepository — contrato de persistência de Organization. Interface apenas, per IMP-002,
 * Etapa 5.
 */
export interface OrganizationRepository {
  create(organization: Organization): Promise<Organization>;
  update(organization: Organization): Promise<Organization>;
  get(organizationId: string): Promise<Organization | undefined>;
  list(tenantId: string): Promise<readonly Organization[]>;
}
