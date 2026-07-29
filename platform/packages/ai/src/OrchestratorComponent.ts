/**
 * Orchestrator Component — os nove sub-componentes internos do Orchestrator, cada um avaliável e
 * evoluível de forma independente, desde que seu contrato de entrada/saída permaneça estável.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export type OrchestratorComponent =
  | "Intent Analyzer"
  | "Context Builder"
  | "Memory Manager"
  | "Capability Selector"
  | "Planning Engine"
  | "Execution Policy Engine"
  | "Agent Coordinator"
  | "Result Consolidator"
  | "Response Builder";
