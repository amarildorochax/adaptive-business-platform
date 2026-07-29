// WidgetPermission.ts
//
// Responsabilidade:
// Contrato de permissão por widget — preparação arquitetural exigida
// pela Sprint 29A. NENHUMA validação real é implementada:
// `allowAllPermissionPolicy` sempre permite a visualização, usado como
// valor padrão até uma Sprint futura de Auth/Permissions implementar
// uma política real sem precisar alterar o contrato nem
// `WidgetController`.
//
// `WidgetPermission` reaproveita o formato já reservado por
// `WidgetDefinition.permissions` (Sprint 28) — não duplica o conceito.

import type { WidgetPermissions } from '../../types';

export interface PermissionContext {
  userId?: string;
  roles?: string[];
}

export type WidgetPermission = WidgetPermissions;

export interface PermissionPolicy {
  canView(context: PermissionContext, permission: WidgetPermission): boolean;
}

/** Política nula — sempre permite. Valor padrão até uma política real existir. */
export const allowAllPermissionPolicy: PermissionPolicy = {
  canView: () => true,
};
