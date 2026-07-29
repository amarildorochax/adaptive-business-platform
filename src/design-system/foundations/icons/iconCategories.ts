// iconCategories.ts
//
// Responsabilidade:
// Taxonomia oficial dos ícones (Sprint 29 — Branding) — agrupa cada
// `IconName` em uma das 4 categorias exigidas pelo ESCOPO (navegação,
// ação, status, módulo) e documenta o critério de uso de cada uma. Ver
// Brand Guide para exemplos.

import type { IconName } from './Icon.types';

export type IconCategory = 'navigation' | 'action' | 'status' | 'module';

/**
 * Critério de uso de cada categoria:
 * - `navigation`: identifica um destino ou área da interface (Sidebar, menu, breadcrumb).
 * - `action`: representa uma operação que o usuário pode disparar (adicionar, editar, remover, atualizar).
 * - `status`: comunica o estado de algo (sucesso, erro, aviso, bloqueio, carregamento) — sempre acompanhado de texto, nunca sozinho.
 * - `module`: identifica visualmente um domínio de negócio da plataforma (CRM, Marketing, Finance...).
 */
export const ICON_CATEGORY_BY_NAME: Record<IconName, IconCategory> = {
  home: 'navigation',
  menu: 'navigation',
  settings: 'navigation',
  user: 'navigation',
  'chevron-down': 'navigation',
  'chevron-up': 'navigation',
  'chevron-left': 'navigation',
  'chevron-right': 'navigation',

  add: 'action',
  edit: 'action',
  delete: 'action',
  refresh: 'action',
  search: 'action',
  close: 'action',
  check: 'action',

  warning: 'status',
  info: 'status',
  success: 'status',
  error: 'status',
  spinner: 'status',
  lock: 'status',

  'module-crm': 'module',
  'module-marketing': 'module',
  'module-finance': 'module',
  'module-analytics': 'module',
  'module-automation': 'module',
  'module-dashboard': 'module',
};

export function iconsByCategory(category: IconCategory): IconName[] {
  return (Object.keys(ICON_CATEGORY_BY_NAME) as IconName[]).filter(
    (name) => ICON_CATEGORY_BY_NAME[name] === category,
  );
}
