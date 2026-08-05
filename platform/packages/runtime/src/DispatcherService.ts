import type { DispatchResult } from "./DispatchResult.js";
import type { DispatchResultRepository } from "./DispatchResultRepository.js";
import type { DispatchTarget, DispatchTargetKind } from "./DispatchTarget.js";
import type { DispatchTargetRepository } from "./DispatchTargetRepository.js";

/**
 * Dispatcher Service — implementa o "Dispatcher" (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4):
 * "Encaminha a solicitação já contextualizada ao componente de domínio responsável... sem decidir,
 * ele mesmo, qual Workflow, qual Regra, ou qual resposta é apropriada." A tecnologia concreta de
 * transporte nunca é decidida por esta Sprint (Seção 16) — `dispatch` recebe `succeeded` já resolvido
 * pelo chamador e apenas registra o fato (`DispatchResult`), mesma disciplina de "nenhuma tecnologia
 * concreta de hospedagem/transporte" já respeitada em toda esta Sprint.
 */
export class DispatcherService {
  constructor(
    private readonly targets: DispatchTargetRepository,
    private readonly results: DispatchResultRepository,
  ) {}

  async registerTarget(kind: DispatchTargetKind, targetDescription: string): Promise<DispatchTarget> {
    const target: DispatchTarget = { dispatchTargetId: crypto.randomUUID(), kind, targetDescription };
    return this.targets.create(target);
  }

  async findTarget(dispatchTargetId: string): Promise<DispatchTarget | undefined> {
    return this.targets.find(dispatchTargetId);
  }

  async dispatch(executionContextId: string, dispatchTargetId: string, succeeded: boolean): Promise<DispatchResult> {
    const result: DispatchResult = {
      dispatchResultId: crypto.randomUUID(),
      executionContextId,
      dispatchTargetId,
      succeeded,
      dispatchedAt: new Date(),
    };
    return this.results.create(result);
  }

  async listResults(executionContextId: string): Promise<readonly DispatchResult[]> {
    return this.results.listByExecutionContextId(executionContextId);
  }
}
