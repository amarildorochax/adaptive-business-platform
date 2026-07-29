/**
 * Execution Isolation Boundary — a garantia, administrada pelo Runtime Isolation Boundary, de que a
 * falha ou o volume excepcional de uma execução específica nunca compromete outra execução
 * concorrente; duas execuções do mesmo Tenant, ou de Tenants distintos, nunca compartilham Execution
 * Context (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 14). Mesmo princípio Failure Isolation já
 * estabelecido em `AUTOMATION_ENGINE.md` e em `BUSINESS_HUB_ARCHITECTURE.md`, aqui aplicado
 * explicitamente à camada de hospedagem que antecede ambos.
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 14.
 */
export interface ExecutionIsolationBoundary {
  /** Identificador do registro de isolamento. */
  readonly executionIsolationBoundaryId: string;

  /** Execution Context isolado — ver ExecutionContext.ts (Sprint 7.1). */
  readonly executionContextId: string;

  /** Tenant ao qual esta execução pertence — nunca compartilhado com outra execução. */
  readonly tenantId: string;

  /** Momento em que o isolamento foi estabelecido. */
  readonly isolatedAt: Date;
}
