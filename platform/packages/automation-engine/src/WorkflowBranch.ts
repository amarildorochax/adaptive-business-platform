/**
 * Workflow Branch — um caminho alternativo dentro de um Workflow, seguido conforme o resultado de
 * Conditions específicas; dentro de um mesmo Workflow, apenas um Branch é seguido por execução,
 * determinado pela primeira Condition satisfeita entre os Branches disponíveis, avaliados sempre na
 * ordem em que foram definidos (`AUTOMATION_ENGINE.md`, Capítulo 8). Um Branch não é bifurcação de
 * execução paralela.
 * `conditionId` e `actionIds` são identificadores opacos — o modelo de Condition é definido na
 * Sprint 6.2 e o modelo de Action na Sprint 6.3, nenhum dos dois antecipado aqui.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 8.
 */
export interface WorkflowBranch {
  /** Identificador do Branch. */
  readonly workflowBranchId: string;

  /** Workflow ao qual este Branch pertence. */
  readonly workflowId: string;

  /** Condition que determina se este Branch é seguido — identificador opaco, sem redefinir o modelo de Condition (Sprint 6.2). */
  readonly conditionId: string;

  /** Ordem de avaliação entre os Branches do mesmo Workflow. */
  readonly order: number;

  /** Actions executadas quando este Branch é seguido — identificadores opacos, sem redefinir o modelo de Action (Sprint 6.3). */
  readonly actionIds: readonly string[];
}
