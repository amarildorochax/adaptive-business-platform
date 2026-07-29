/**
 * Pipeline Observability Validation — o registro declarativo de que, para uma etapa correlacionada do
 * Pipeline de Decisão (`PipelineObservabilityCorrelation`), as informações mínimas exigidas por
 * `ObservabilityContext` (Component 25) estão presentes: `correlationId` e `componentType`, os únicos
 * dois campos não opcionais daquele contrato — `traceId` e `spanId` permanecem opcionais e, portanto,
 * fora do escopo desta verificação mínima.
 * Mesmo padrão declarativo já usado por `ContextValidationResult` (Component 15) e `MemoryValidation`
 * (Component 16), reaplicado aqui por analogia direta, sem redefinir `ObservabilityContext` nem
 * implementar a verificação, a coleta, ou qualquer mecanismo de observabilidade em tempo real.
 * Artefato de integração INT-10, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-10.
 */
export interface PipelineObservabilityValidation {
  /** Solicitação à qual esta validação se refere. */
  readonly requestId: string;

  /** Etapa do Pipeline de Decisão validada — valor opaco, sem redefinir DecisionPipelineStage (Component 17). */
  readonly stage: string;

  /** Se o campo obrigatório `correlationId` está presente. */
  readonly correlationIdPresent: boolean;

  /** Se o campo obrigatório `componentType` está presente. */
  readonly componentTypePresent: boolean;

  /** Momento em que a verificação foi concluída. */
  readonly validatedAt: Date;
}
