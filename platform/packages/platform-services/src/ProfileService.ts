import type { Identity } from './Identity';
import type { Profile } from './Profile';
import type { ProfileRepository } from './ProfileRepository';
import type { Role } from './Role';

/**
 * Profile Service — administra a associação entre uma Identity, um Tenant e um Papel — "a instância
 * concreta de um Usuário dentro de um Workspace específico" (`IDENTITY_HUB.md`, Capítulo 8). Um
 * Perfil por Workspace, nunca compartilhado entre Workspaces (mesmo Capítulo).
 */
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /** Cria o Perfil, ou atualiza o Papel de um Perfil já existente para o mesmo par Identity/Tenant — "Troca de função" (`IDENTITY_HUB.md`, Capítulo 18). */
  async assignRole(identity: Identity, tenantId: string, role: Role): Promise<Profile> {
    const existing = await this.repository.find(identity, tenantId);

    if (existing) {
      return this.repository.update({ ...existing, role });
    }

    return this.repository.create({ profileId: crypto.randomUUID(), identity, tenantId, role, createdAt: new Date() });
  }

  async find(identity: Identity, tenantId: string): Promise<Profile | undefined> {
    return this.repository.find(identity, tenantId);
  }

  async listByIdentity(identity: Identity): Promise<readonly Profile[]> {
    return this.repository.listByIdentity(identity);
  }
}
