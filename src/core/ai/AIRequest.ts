import type { AIRequestOptions } from "./AIRequestOptions";

/**
 * Requisição genérica de geração de conteúdo, agnóstica de provider —
 * o único formato de entrada que AIGateway aceita.
 *
 * `providerId`, quando presente, pede explicitamente um provider
 * específico (AIRouter o resolve com prioridade sobre `env.aiProvider`);
 * quando ausente, AIRouter decide.
 *
 * `options` carrega os pontos de extensão futuros (Retry/Fallback/
 * Timeout/RateLimit/Stream — ver AIRequestOptions.ts) — nenhum é lido
 * por nenhum componente nesta Sprint.
 */
export interface AIRequest {
  prompt: string;

  model?: string;

  providerId?: string;

  maxTokens?: number;

  temperature?: number;

  metadata?: Record<string, unknown>;

  options?: AIRequestOptions;
}
