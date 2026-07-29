// ModuleId.ts
//
// Responsabilidade:
// Identificador estável de cada módulo do Core preparado para
// integração. Corresponde 1:1 aos 13 diretórios já reservados em
// `@/app/features/*` (Sprint 27A) — não introduz nenhum domínio novo.

export type CoreModuleId =
  | 'crm'
  | 'campaign'
  | 'marketing'
  | 'finance'
  | 'analytics'
  | 'dashboard'
  | 'automation'
  | 'workflow'
  | 'execution'
  | 'knowledge'
  | 'notifications'
  | 'business-intelligence'
  | 'settings';
