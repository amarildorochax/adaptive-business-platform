import type { AITokenUsage } from "./AITokenUsage";

/**
 * Resposta padronizada de qualquer AIProvider, sempre no mesmo formato
 * independente de qual provider a produziu — é isso que torna
 * `AIGateway.generate()` um único ponto de saída consistente.
 */
export interface AIResponse {
  success: boolean;

  content: string;

  /** Igual a `AIProvider.id` do provider que gerou esta resposta. */
  provider: string;

  model?: string;

  createdAt: Date;

  /** Preenchido por BaseAIProvider.generate() — tempo entre a chamada e a resposta. */
  latencyMs?: number;

  tokenUsage?: AITokenUsage;
}
