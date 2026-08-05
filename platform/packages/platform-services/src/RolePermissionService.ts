import type { Permission, Role } from './Role';
import type { RolePermission } from './RolePermission';
import type { RolePermissionRepository } from './RolePermissionRepository';

/**
 * Role Permission Service — o RBAC Engine desta Sprint: "resolve Permissões a partir da associação
 * de um Usuário a um Papel nomeado" (`IDENTITY_HUB.md`, Capítulo 7). Nunca resolve por atributo
 * contextual (ABAC) nem por regra declarativa (Policy) — ambos "médio prazo" per o Roadmap, Capítulo
 * 19.
 */
export class RolePermissionService {
  constructor(private readonly repository: RolePermissionRepository) {}

  async grant(role: Role, permissionName: Permission['name']): Promise<RolePermission> {
    return this.repository.grant({ role, permission: permissionName });
  }

  async resolvePermissions(role: Role): Promise<readonly Permission[]> {
    const grants = await this.repository.listByRole(role);
    return grants.map((grant) => ({ name: grant.permission }));
  }
}
