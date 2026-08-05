import type { ExecutionLifecycleStage, ExecutionLifecycleState } from "./ExecutionLifecycleState.js";
import type { ExecutionLifecycleStateRepository } from "./ExecutionLifecycleStateRepository.js";

/**
 * Execution Lifecycle Service — administra o Public Contract "Execution Lifecycle State"
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 5 e 6): "Received → Context Established → Dispatched →
 * Running → Completed | Failed". Cada transição é validada contra a sequência literal do Capítulo 6 —
 * nunca pula nem reordena um estágio (mesma disciplina de guarda de estágio já usada em
 * `IncidentService`, IMP-012). `Completed` e `Failed` são estágios terminais — nenhuma transição parte
 * deles.
 */
const ALLOWED_TRANSITIONS: Record<ExecutionLifecycleStage, readonly ExecutionLifecycleStage[]> = {
  Received: ["ContextEstablished"],
  ContextEstablished: ["Dispatched"],
  Dispatched: ["Running", "Failed"],
  Running: ["Completed", "Failed"],
  Completed: [],
  Failed: [],
};

export class ExecutionLifecycleService {
  constructor(private readonly repository: ExecutionLifecycleStateRepository) {}

  async start(executionContextId: string): Promise<ExecutionLifecycleState> {
    return this.record(executionContextId, "Received");
  }

  async advance(executionContextId: string, next: ExecutionLifecycleStage): Promise<ExecutionLifecycleState> {
    const current = await this.currentStage(executionContextId);
    if (!current) {
      throw new Error(`Execution Context "${executionContextId}" ainda não iniciou seu ciclo de vida.`);
    }

    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new Error(`Transição inválida de "${current}" para "${next}" em "${executionContextId}".`);
    }

    return this.record(executionContextId, next);
  }

  async currentStage(executionContextId: string): Promise<ExecutionLifecycleStage | undefined> {
    const states = await this.repository.listByExecutionContextId(executionContextId);
    return states[states.length - 1]?.stage;
  }

  async history(executionContextId: string): Promise<readonly ExecutionLifecycleState[]> {
    return this.repository.listByExecutionContextId(executionContextId);
  }

  private async record(executionContextId: string, stage: ExecutionLifecycleStage): Promise<ExecutionLifecycleState> {
    const state: ExecutionLifecycleState = { executionContextId, stage, enteredAt: new Date() };
    return this.repository.create(state);
  }
}
