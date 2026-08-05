import type { Identity } from './Identity';
import type { Profile } from './Profile';

/** Contrato de persistência de Profile — apenas o contrato. `update` existe apenas para a "Troca de função" (`IDENTITY_HUB.md`, Capítulo 18) — mudança de Papel de um Perfil já existente. */
export interface ProfileRepository {
  create(profile: Profile): Promise<Profile>;
  update(profile: Profile): Promise<Profile>;
  find(identity: Identity, tenantId: string): Promise<Profile | undefined>;
  listByIdentity(identity: Identity): Promise<Profile[]>;
}
