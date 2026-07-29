/**
 * Workflow — dado estruturado (Trigger, Conditions, Branches, Actions), nunca código compilado
 * específico de uma empresa (Workflow as Configuration, `AUTOMATION_ENGINE.md`, Capítulo 5, ADR-002).
 * `triggerId` e `actionIds` são identificadores opacos: o modelo de Trigger é definido na Sprint 6.2
 * e o modelo de Action na Sprint 6.3, ambas fora do escopo desta Sprint — nenhum tipo daquelas
 * Sprints é antecipado ou importado aqui.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 8.
 */
export type WorkflowStatus = "Draft" | "Active" | "Inactive";

export interface Workflow {
  /** Identificador do Workflow. */
  readonly workflowId: string;

  /** Tenant ao qual o Workflow pertence. */
  readonly tenantId: string;

  /** Nome do Workflow. */
  readonly name: string;

  /** Estado do ciclo de vida do Workflow em si — distinto do resultado de uma Execution. */
  readonly status: WorkflowStatus;

  /** Número da versão — ver WorkflowVersion.ts. */
  readonly version: number;

  /** Trigger que inicia a avaliação deste Workflow — identificador opaco, sem redefinir o modelo de Trigger (Sprint 6.2). */
  readonly triggerId: string;

  /** Actions executadas quando nenhum Branch específico se aplica — identificadores opacos, sem redefinir o modelo de Action (Sprint 6.3). */
  readonly actionIds: readonly string[];

  /** Momento de criação. */
  readonly createdAt: Date;
}
