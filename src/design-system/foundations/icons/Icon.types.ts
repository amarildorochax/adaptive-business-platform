// Icon.types.ts
//
// Responsabilidade:
// Contrato arquitetural do sistema de ícones — nomes reservados e props
// esperadas pelo componente `<Icon>` (`@/app/primitives/Icon`). Nenhum
// asset (SVG) real é implementado ainda — a renderização concreta fica
// para quando um conjunto real de ícones for escolhido; até lá, `Icon`
// reserva o espaço e o rótulo acessível correto.
//
// Nota (Sprint 29 — Branding, Iconografia): o conjunto abaixo foi
// ampliado e organizado por categoria em `iconCategories.ts`
// (navegação/ação/status/módulo), conforme exigido pelo ESCOPO
// ("Padronizar ícones de navegação, ações, status e módulos"). Nenhum
// nome anterior (Sprint 26) foi removido ou renomeado — apenas
// adicionados novos, então nenhum consumidor existente quebra.

export type IconName =
  // já reservados na Sprint 26
  | 'check'
  | 'close'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'warning'
  | 'info'
  | 'success'
  | 'error'
  | 'spinner'
  // Sprint 29 — navegação
  | 'home'
  | 'menu'
  | 'settings'
  | 'user'
  // Sprint 29 — ações
  | 'add'
  | 'edit'
  | 'delete'
  | 'refresh'
  // Sprint 29 — status
  | 'lock'
  // Sprint 29 — módulos
  | 'module-crm'
  | 'module-marketing'
  | 'module-finance'
  | 'module-analytics'
  | 'module-automation'
  | 'module-dashboard';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  'aria-label'?: string;
}
