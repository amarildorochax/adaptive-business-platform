import type { AuthorizationDecision } from './AuthorizationDecision';
import type { Identity } from './Identity';
import { ProfileService } from './ProfileService';
import { RolePermissionService } from './RolePermissionService';

/**
 * Authorization Service — o Authorization Engine desta Sprint: "confirma o que essa identidade, já
 * confirmada, tem permissão de fazer" (`IDENTITY_HUB.md`, Capítulo 2), combinando RBAC (Perfil →
 * Papel → Permissão) apenas — ABAC e Policy Engine são "médio prazo" (Capítulo 19), nunca
 * implementados nesta Sprint. Least Privilege: uma Identity sem Perfil no Tenant nunca é autorizada
 * por padrão.
 */
export class AuthorizationService {
  constructor(
    private readonly profiles: ProfileService,
    private readonly rolePermissions: RolePermissionService,
  ) {}

  async authorize(identity: Identity, tenantId: string, action: string): Promise<AuthorizationDecision> {
    const profile = await this.profiles.find(identity, tenantId);

    if (!profile) {
      return { identity, action, permitted: false, decidedAt: new Date() };
    }

    const permissions = await this.rolePermissions.resolvePermissions(profile.role);
    const permitted = permissions.some((permission) => permission.name === action);

    return { identity, action, permitted, decidedAt: new Date() };
  }
}
