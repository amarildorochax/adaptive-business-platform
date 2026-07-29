/**
 * Consumo de tokens de uma chamada de geração, quando o provider o
 * reporta. Campos individuais podem ser aproximados (ex.: MockAIProvider
 * estima por comprimento de texto) — nunca cobrado/faturado, apenas
 * informativo.
 */
export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
