import type { Identity } from './Identity';
import type { Role } from './Role';

/**
 * Profile — "a instância concreta de um Usuário dentro de um Workspace específico, associada a um
 * Papel nomeado" (`IDENTITY_HUB.md`, Capítulo 8). Nomeado `Profile`, nunca `TenantMembership` (nome
 * de exemplo desta própria Sprint) — o Blueprint já usa "Perfil" como termo consistente em toda a sua
 * extensão (Capítulos 8, 10, 12, 18), tratado aqui como o vocabulário já aprovado, e o texto de
 * exemplo da Sprint como ilustrativo, mesmo padrão já aplicado em toda Sprint anterior desta série.
 *
 * Um Perfil por Workspace, nunca compartilhado entre Workspaces mesmo quando a mesma Identity os
 * acessa (`IDENTITY_HUB.md`, Capítulo 8, "cada Perfil associado a exatamente um Workspace").
 */
export interface Profile {
  readonly profileId: string;
  readonly identity: Identity;
  readonly tenantId: string;
  readonly role: Role;
  readonly createdAt: Date;
}
