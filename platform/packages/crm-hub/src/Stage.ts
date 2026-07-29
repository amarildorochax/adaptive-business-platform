/**
 * Stage — etapa específica dentro de um Pipeline, com critério de entrada e de saída determinístico
 * ou, quando aplicável, assistido por recomendação do AI Hub — sempre uma decisão que o CRM Hub
 * aplica, nunca uma inteligência que ele implementa internamente.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Stage {
  /** Identificador do Stage. */
  readonly stageId: string;

  /** Pipeline ao qual este Stage pertence. */
  readonly pipelineId: string;

  /** Nome do Stage, configurável por Empresa (ex.: "Triagem", "Proposta enviada"). */
  readonly name: string;

  /** Posição de ordem dentro do Pipeline. */
  readonly order: number;
}
