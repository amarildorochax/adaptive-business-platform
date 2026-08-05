import type { ExecutionIsolationBoundary } from "./ExecutionIsolationBoundary.js";
import type { ExecutionIsolationBoundaryRepository } from "./ExecutionIsolationBoundaryRepository.js";

/**
 * Execution Isolation Boundary Service — implementa o "Runtime Isolation Boundary"
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4 e 14): "Garante que a falha de uma execução nunca
 * comprometa outra execução concorrente." `establish` nunca é chamado duas vezes para o mesmo
 * Execution Context — "Duas execuções... nunca compartilham Execution Context".
 */
export class ExecutionIsolationBoundaryService {
  constructor(private readonly repository: ExecutionIsolationBoundaryRepository) {}

  async establish(executionContextId: string, tenantId: string): Promise<ExecutionIsolationBoundary> {
    const existing = await this.repository.findByExecutionContextId(executionContextId);
    if (existing) {
      throw new Error(`Execution Context "${executionContextId}" já possui um Isolation Boundary estabelecido.`);
    }

    const boundary: ExecutionIsolationBoundary = {
      executionIsolationBoundaryId: crypto.randomUUID(),
      executionContextId,
      tenantId,
      isolatedAt: new Date(),
    };
    return this.repository.create(boundary);
  }

  async find(executionContextId: string): Promise<ExecutionIsolationBoundary | undefined> {
    return this.repository.findByExecutionContextId(executionContextId);
  }
}
