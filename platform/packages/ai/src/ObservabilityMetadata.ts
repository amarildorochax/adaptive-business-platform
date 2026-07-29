/**
 * Observability Metadata — metadado estrutural de um evento observável, sustentando a mesma
 * disciplina de rastreabilidade já aplicada aos demais componentes de AI Core.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export interface ObservabilityMetadata {
  /** Evento ao qual este metadado pertence. */
  readonly eventId: string;

  /** Momento de criação do registro. */
  readonly createdAt: Date;

  /** Versão do registro. */
  readonly version: string;
}
