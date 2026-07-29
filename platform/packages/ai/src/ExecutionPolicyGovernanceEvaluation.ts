/**
 * Execution Policy Governance Evaluation — o registro de que a etapa Execution Policy do Pipeline de
 * Decisão foi avaliada contra Política de Governança já registrada, vinculando a subtarefa às
 * Políticas consultadas através de identificador opaco, sem redefinir a estrutura da Política
 * (Component 24), seu efeito (`GovernanceEffect`), nem `ExecutionPolicy` (Component 17).
 * Este artefato registra que a avaliação ocorreu — o enforcement da Política permanece
 * responsabilidade exclusiva de AI Governance, nunca duplicado ou antecipado aqui.
 * Artefato de integração INT-04, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-04.
 */
export interface ExecutionPolicyGovernanceEvaluation {
  /** Subtarefa cuja Execution Policy foi avaliada — mesmo identificador de `ExecutionPolicy`. */
  readonly subtaskId: string;

  /** Políticas de Governança consultadas — identificadores opacos, sem redefinir GovernancePolicy (Component 24). */
  readonly policyIds: readonly string[];

  /** Momento em que a avaliação foi concluída. */
  readonly evaluatedAt: Date;
}
