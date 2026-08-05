import { describe, expect, it } from 'vitest';
import { AuthorizationService } from './AuthorizationService';
import { ProfileService } from './ProfileService';
import { RolePermissionService } from './RolePermissionService';
import { FakeProfileRepository, FakeRolePermissionRepository } from './testing/InMemoryFakes';

function buildService() {
  const profiles = new ProfileService(new FakeProfileRepository());
  const rolePermissions = new RolePermissionService(new FakeRolePermissionRepository());
  return { service: new AuthorizationService(profiles, rolePermissions), profiles, rolePermissions };
}

describe('AuthorizationService — RBAC Engine (Least Privilege)', () => {
  it('nega por padrão quando a Identity não tem nenhum Perfil no Tenant', async () => {
    const { service } = buildService();

    const decision = await service.authorize('identity-1', 'tenant-1', 'crm:read');

    expect(decision.permitted).toBe(false);
  });

  it('permite quando o Papel do Perfil possui a Permissão concedida', async () => {
    const { service, profiles, rolePermissions } = buildService();
    await profiles.assignRole('identity-1', 'tenant-1', 'Financeiro');
    await rolePermissions.grant('Financeiro', 'finance:read');

    const decision = await service.authorize('identity-1', 'tenant-1', 'finance:read');

    expect(decision.permitted).toBe(true);
  });

  it('nega quando o Papel do Perfil não possui a Permissão solicitada', async () => {
    const { service, profiles, rolePermissions } = buildService();
    await profiles.assignRole('identity-1', 'tenant-1', 'Marketing');
    await rolePermissions.grant('Marketing', 'growth:read');

    const decision = await service.authorize('identity-1', 'tenant-1', 'finance:read');

    expect(decision.permitted).toBe(false);
  });
});
