/**
 * Pipeline Observability Correlation — o registro declarativo de que uma etapa do Pipeline de Decisão
 * (Component 17), para uma solicitação específica, correlaciona-se a um sinal observável
 * (`ObservabilityContext.correlationId`, Component 25), sem redefinir `DecisionPipelineState`
 * (Component 17) nem `ObservabilityContext`/`ObservabilityEvent` (Component 25).
 * A etapa é referenciada por `stage: string` — nunca pelo tipo literal `DecisionPipelineStage`
 * (Component 17) — preservando a mesma disciplina de identificador opaco já aplicada a todos os
 * demais componentes referenciados por AI Observability.
 * Esta correlação é puramente declarativa: nenhuma coleta de métrica, logging, tracing distribuído,
 * dashboard, alerta, OpenTelemetry, Prometheus, ou monitoramento em tempo real é implementado por ela.
 * Artefato de integração INT-10, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-10.
 */
export interface PipelineObservabilityCorrelation {
  /** Solicitação em processamento pelo Orchestrator — mesmo identificador de `DecisionPipelineState.requestId`. */
  readonly requestId: string;

  /** Etapa do Pipeline de Decisão correlacionada — valor opaco, sem redefinir DecisionPipelineStage (Component 17). */
  readonly stage: string;

  /** Identificador de correlação raiz do sinal observável — mesmo campo de `ObservabilityContext.correlationId` (Component 25). */
  readonly correlationId: string;

  /** Momento em que a correlação foi registrada. */
  readonly correlatedAt: Date;
}
