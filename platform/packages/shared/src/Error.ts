/**
 * Errors — taxonomia comum de erro técnico, distinta por natureza, livre de regra de negócio.
 * Categorias, estrutura e invariantes definidas em ERRORS_CONCRETE_STRUCTURE.md.
 */
export type ErrorCategory =
  | "ContractViolated"
  | "PermissionMissing"
  | "DependencyUnavailable"
  | "MalformedEvent"
  | "ConfigurationLoadFailure";

export interface PlatformError {
  /** Uma das cinco categorias técnicas já identificadas — nenhuma outra é permitida. */
  readonly category: ErrorCategory;

  /** Descrição diagnóstica do erro, sem lógica de negócio. */
  readonly message: string;
}
