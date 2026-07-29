/**
 * Runtime Resilience & Observability Component — os três componentes internos pertencentes à
 * Sprint 7.2, subconjunto do catálogo completo de seis componentes já descritos em
 * `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4. Com esta Sprint, os seis componentes do Runtime
 * estão integralmente catalogados entre `RuntimeCoreDispatchComponent.ts` (3, Sprint 7.1) e este
 * arquivo (3).
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4.
 */
export type RuntimeResilienceObservabilityComponent =
  | "Runtime Retry Coordinator"
  | "Runtime Isolation Boundary"
  | "Runtime Observability Collector";
