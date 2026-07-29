/**
 * Context Assembly Result — o registro de que a etapa Context Assembly do Pipeline de Decisão foi
 * concluída para uma solicitação, vinculando-a ao Contexto já resolvido pelo Context Builder através
 * de identificador opaco, sem redefinir a estrutura do Contexto (Component 15) nem o estado do
 * pipeline (`DecisionPipelineState`, Component 17).
 * Artefato de integração INT-01, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-01.
 */
export interface ContextAssemblyResult {
  /** Solicitação para a qual o Contexto foi montado. */
  readonly requestId: string;

  /** Contexto resolvido — identificador opaco, sem redefinir Context (Component 15). */
  readonly contextId: string;

  /** Momento em que a etapa Context Assembly foi concluída para esta solicitação. */
  readonly assembledAt: Date;
}
