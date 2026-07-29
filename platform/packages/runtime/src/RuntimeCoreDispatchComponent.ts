/**
 * Runtime Core Dispatch Component — os três componentes internos pertencentes à Sprint 7.1,
 * subconjunto do catálogo completo de seis componentes já descritos em
 * `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4. Os três componentes de Resilience & Observability
 * (Sprint 7.2) não são catalogados aqui.
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4.
 */
export type RuntimeCoreDispatchComponent =
  | "Runtime Manager"
  | "Execution Context Manager"
  | "Dispatcher";
