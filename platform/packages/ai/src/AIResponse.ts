import type { AITokenUsage } from './AITokenUsage';

/**
 * AI Response — a resposta padronizada de qualquer Provider, sempre no mesmo formato independente de
 * qual Provider a produziu — é isso que torna o AI Gateway um único ponto de saída consistente
 * (`AI_HUB.md`, Capítulo 7). Adaptado de `src/core/ai/AIResponse.ts` (AI Gateway legado, real e
 * funcional).
 */
export interface AIResponse {
  readonly success: boolean;
  readonly content: string;
  /** Igual a `AIProvider.id` do Provider que gerou esta resposta. */
  readonly providerId: string;
  readonly model?: string;
  readonly createdAt: Date;
  readonly latencyMs?: number;
  readonly tokenUsage?: AITokenUsage;
}
