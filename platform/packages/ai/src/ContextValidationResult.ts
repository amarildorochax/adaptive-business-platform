/**
 * Context Validation Result — resultado das cinco verificações aplicadas a toda informação antes de
 * sua incorporação formal a um Contexto.
 * Estrutura definida em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export interface ContextValidationResult {
  /** Contexto validado. */
  readonly contextId: string;

  /** Se a origem é tecnicamente correta e reconhecida. */
  readonly validated: boolean;

  /** Se não há contradição não resolvida com o restante do Contexto. */
  readonly consistent: boolean;

  /** Se a atribuição de propriedade já registrada é respeitada. */
  readonly ownershipRespected: boolean;

  /** Se a informação não foi corrompida ou truncada. */
  readonly intact: boolean;

  /** Se o grau de certeza associado é explicitamente preservado. */
  readonly trustworthy: boolean;
}
