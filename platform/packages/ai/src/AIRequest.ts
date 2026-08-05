/**
 * AI Request — a requisição genérica de geração de conteúdo, agnóstica de Provider, o único formato
 * de entrada que o AI Gateway aceita (`AI_HUB.md`, Capítulo 7, "Gateway... aceitar, validar, e
 * encaminhar"). Adaptado de `src/core/ai/AIRequest.ts` (AI Gateway legado, real e funcional) — `tenantId`
 * adicionado como extensão prática, ausente do legado (pré-multiempresa), exigido pelo isolamento
 * absoluto entre Empresas já Frozen (`AI_HUB.md`, ADR-008, Capítulo 20).
 *
 * `providerId`, quando presente, pede explicitamente um Provider específico — o Provider Router o
 * resolve com prioridade sobre a política padrão; quando ausente, o Provider Router decide.
 */
export interface AIRequest {
  readonly tenantId: string;
  readonly prompt: string;
  readonly model?: string;
  readonly providerId?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
}
