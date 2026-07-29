/**
 * Observability Lifecycle — os quatro estágios do ciclo de vida declarativo de um evento observável,
 * extraídos do fluxo formal de Diagnóstico: anomalia detectada, investigação em curso, causa raiz
 * identificada, e encerramento.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export type ObservabilityLifecycleStage =
  | "Detected"
  | "UnderDiagnosis"
  | "RootCauseIdentified"
  | "Closed";
