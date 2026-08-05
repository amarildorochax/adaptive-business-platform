import type { Permission, Role } from './Role';

/**
 * Role Permission — o vínculo entre um Papel e uma Permissão, materializando "Papel é o agrupamento
 * reutilizável de Permissões" (`IDENTITY_HUB.md`, Capítulo 8). Nunca uma lista estática por Identity
 * — a Permissão de uma Identity é sempre resolvida em tempo de requisição, a partir de seu Perfil
 * (Papel) e dos vínculos aqui registrados, nunca armazenada diretamente contra a Identity.
 */
export interface RolePermission {
  readonly role: Role;
  readonly permission: Permission['name'];
}
