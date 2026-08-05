/**
 * AI Token Usage — o consumo de token de uma chamada de geração, quando o provedor o reporta.
 * Adaptado de `src/core/ai/AITokenUsage.ts` (AI Gateway legado, real e funcional) — campos
 * individuais podem ser aproximados (o MockAIProvider estima por comprimento de texto), nunca
 * cobrado/faturado, apenas informativo. Alimenta o Token Manager/Cost Manager (`AI_HUB.md`, Capítulos
 * 7 e 21), nenhum dos dois implementado nesta Sprint (infraestrutura de cobrança, fora de escopo).
 */
export interface AITokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}
