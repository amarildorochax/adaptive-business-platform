import type { WorkflowDefinition } from "./WorkflowDefinition";
import type { WorkflowPlan } from "./WorkflowPlan";

/**
 * Contrato de persistência futura para WorkflowRegistry/WorkflowEngine
 * (Tarefa 11 — não implementado nesta Sprint). Mesmo papel que
 * `MemoryPersistenceAdapter` (`@/core/memory`) cumpre para MemoryStore.
 *
 * Responsabilidade reservada: quando um backend de persistência real
 * for autorizado em uma Sprint futura, ele deve implementar esta
 * interface — `WorkflowRegistry`/`WorkflowEngine` então passariam a
 * delegar a ela em vez de manter apenas `Map`s em memória. Nenhum
 * componente desta Sprint instancia, consome, ou depende deste
 * contrato.
 */
export interface WorkflowPersistenceAdapter {
  saveDefinition(definition: WorkflowDefinition): Promise<void>;
  loadDefinition(id: string): Promise<WorkflowDefinition | undefined>;
  savePlan(plan: WorkflowPlan): Promise<void>;
  loadPlan(id: string): Promise<WorkflowPlan | undefined>;
}
