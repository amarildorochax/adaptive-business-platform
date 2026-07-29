// AIRequestOptions.ts
//
// Responsabilidade (Tarefa 11 — Preparar arquitetura para o futuro):
// contratos e pontos de extensão para Retry, Fallback, Timeout, Rate
// Limit e Streaming — nenhum é implementado nesta Sprint. `AIRequest.options`
// (AIRequest.ts) já aceita este formato hoje; nenhum componente
// (AIGateway, AIRouter, BaseAIProvider) ainda lê nenhum destes campos.
// Adicionar o comportamento real, quando chegar a vez, não deve exigir
// nenhuma mudança estrutural — apenas passar a consumir o que já está
// aqui declarado.

/** Reserva de política de nova tentativa em caso de falha. Não implementado. */
export interface AIRetryOptions {
  maxAttempts: number;
  backoffMs?: number;
}

/** Reserva de lista ordenada de providers alternativos em caso de falha do principal. Não implementado. */
export interface AIFallbackOptions {
  providerIds: string[];
}

/** Reserva de tempo limite de espera por resposta. Não implementado. */
export interface AITimeoutOptions {
  timeoutMs: number;
}

/** Reserva de limite de requisições por janela de tempo. Não implementado. */
export interface AIRateLimitOptions {
  requestsPerMinute: number;
}

/** Um fragmento de resposta em streaming. Não implementado — nenhum provider emite isto ainda. */
export interface AIStreamChunk {
  content: string;
  done: boolean;
}

/** Reserva de streaming incremental de resposta. Não implementado. */
export interface AIStreamOptions {
  enabled: boolean;
  onChunk?: (chunk: AIStreamChunk) => void;
}

/**
 * Conjunto de pontos de extensão futuros de uma AIRequest — todos
 * opcionais, todos não implementados nesta Sprint. Nenhum destes campos
 * é lido por AIGateway/AIRouter/BaseAIProvider hoje.
 */
export interface AIRequestOptions {
  retry?: AIRetryOptions;
  fallback?: AIFallbackOptions;
  timeout?: AITimeoutOptions;
  rateLimit?: AIRateLimitOptions;
  stream?: AIStreamOptions;
}
