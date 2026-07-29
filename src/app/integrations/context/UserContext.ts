// UserContext.ts
//
// Responsabilidade:
// Reexporta `UserContext`/`anonymousUserContext` já definidos em
// `@/app/integrations/types` (Sprint 30) — o Pipeline não duplica o
// contrato, apenas o compõe dentro de `PipelineContext`.

export type { UserContext } from '../types/UserContext';
export { anonymousUserContext } from '../types/UserContext';
