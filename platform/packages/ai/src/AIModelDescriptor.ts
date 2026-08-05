/**
 * AI Model Descriptor — a descrição de um modelo suportado por um Provider, consultada pelo Model
 * Registry (`AI_HUB.md`, Capítulo 16) antes de qualquer decisão de roteamento. Adaptado do tipo
 * inline `AIModel` já declarado em `src/core/ai/ProviderCapabilities.ts` (AI Gateway legado, real e
 * funcional) — nomeado `AIModelDescriptor`, nunca `AIModel`, para nunca colidir com um futuro `Model
 * Version`/`Model Registry` mais completo, já reservado como lacuna genuína por
 * `AI_HUB_ARCHITECTURE.md`, Capítulo 1 ("Model Version como entidade explícita do Model Registry"),
 * fora do escopo desta Sprint.
 */
export interface AIModelDescriptor {
  readonly id: string;
  readonly providerId: string;
  readonly contextWindow?: number;
}
