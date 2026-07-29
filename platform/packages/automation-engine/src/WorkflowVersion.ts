/**
 * Workflow Version — a identificação de versão aplicada a cada estado relevante de um Workflow,
 * permitindo reconstruir qual definição de Workflow estava ativa em um momento específico do
 * passado (Workflow Versioning, `AUTOMATION_ENGINE.md`, Capítulo 7).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface WorkflowVersion {
  /** Workflow versionado. */
  readonly workflowId: string;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi substituída, quando aplicável. */
  readonly supersededAt?: Date;
}
