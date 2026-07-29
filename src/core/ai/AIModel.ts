/**
 * Identidade de um modelo de linguagem específico oferecido por um
 * AIProvider (ex.: "gpt-4o" da OpenAI, "claude-3-opus" da Claude).
 * Usado por ProviderCapabilities.models — nunca instanciado como
 * chamada real de API nesta Sprint.
 */
export interface AIModel {
  id: string;

  /** Igual a `AIProvider.id` do provider que o oferece. */
  provider: string;

  contextWindow?: number;
}
