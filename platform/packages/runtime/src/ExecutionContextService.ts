import type { ExecutionContext } from "./ExecutionContext.js";
import type { ExecutionContextRepository } from "./ExecutionContextRepository.js";

/**
 * Execution Context Service — implementa o "Execution Context Manager"
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4): "Estabelece e propaga o Execution Context por toda
 * a vida de uma execução." Nunca armazena dado de domínio — apenas correlação, Tenant e Identidade
 * (Seção 11), ambos sempre identificadores opacos.
 */
export class ExecutionContextService {
  constructor(private readonly repository: ExecutionContextRepository) {}

  async establish(correlationId: string, tenantId: string, identityId: string): Promise<ExecutionContext> {
    const context: ExecutionContext = {
      executionContextId: crypto.randomUUID(),
      correlationId,
      tenantId,
      identityId,
      establishedAt: new Date(),
    };
    return this.repository.create(context);
  }

  async find(executionContextId: string): Promise<ExecutionContext | undefined> {
    return this.repository.find(executionContextId);
  }
}
