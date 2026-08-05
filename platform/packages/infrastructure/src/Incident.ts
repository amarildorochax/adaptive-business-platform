/**
 * Incident — "toda ocorrência que viola um SLO já definido, sempre registrada, investigada e
 * encerrada através de processo formal" (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9). O processo
 * formal em si, Capítulo 13: "detecção, classificação de severidade, mitigação, resolução, e revisão
 * posterior" — as cinco etapas literais do texto, nunca reordenadas nem puladas (ver IncidentService).
 * `severity` é deliberadamente `string`, não um enum fechado: o Blueprint exige que a severidade seja
 * "sempre classificada em função de seu impacto de negócio real, nunca apenas de sua causa técnica" e
 * nunca enumera um conjunto fechado de níveis — mesmo tratamento já dado a `Role` (IAM, IMP-011).
 * Estrutura ausente de `OBSERVABILITY_CONCRETE_STRUCTURE.md` — gap coberto nesta Sprint (IMP-012).
 */
export type IncidentStage = "Detected" | "SeverityClassified" | "Mitigated" | "Resolved" | "Reviewed";

export interface Incident {
  readonly incidentId: string;
  /** Ausente até a etapa "SeverityClassified" — nenhuma severidade é assumida antes da classificação real. */
  readonly severity?: string;
  readonly triggeredBy: string;
  readonly stage: IncidentStage;
  readonly detectedAt: Date;
}
