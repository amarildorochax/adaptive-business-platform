import type { DispatchRetryAttempt } from "./DispatchRetryAttempt.js";
import type { DispatchRetryAttemptRepository } from "./DispatchRetryAttemptRepository.js";

/**
 * Runtime Retry Coordinator Service — implementa o "Runtime Retry Coordinator"
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4 e 13): "Aplica nova tentativa de nível de transporte
 * quando o próprio Dispatch falha por motivo transitório, antes de a solicitação alcançar seu
 * destino." Nunca a Retry Policy de uma Action do Automation Engine (Seção 8) — opera estritamente
 * antes do Dispatch bem-sucedido. `recordAttempt` calcula `attemptNumber` a partir do próprio
 * histórico já registrado — nunca aceita um número informado pelo chamador, evitando duplicidade ou
 * lacuna na sequência.
 */
export class RuntimeRetryCoordinatorService {
  constructor(private readonly repository: DispatchRetryAttemptRepository) {}

  async recordAttempt(executionContextId: string, dispatchTargetId: string): Promise<DispatchRetryAttempt> {
    const previous = await this.repository.listByExecutionContextId(executionContextId);
    const attempt: DispatchRetryAttempt = {
      dispatchRetryAttemptId: crypto.randomUUID(),
      executionContextId,
      dispatchTargetId,
      attemptNumber: previous.length + 1,
      attemptedAt: new Date(),
    };
    return this.repository.create(attempt);
  }

  async history(executionContextId: string): Promise<readonly DispatchRetryAttempt[]> {
    return this.repository.listByExecutionContextId(executionContextId);
  }
}
