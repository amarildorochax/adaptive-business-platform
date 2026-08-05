import type { AIModelDescriptor } from './AIModelDescriptor';

/**
 * Provider Capabilities — o que um Provider concreto declaradamente suporta, consultado antes de
 * qualquer decisão de roteamento que exija um recurso específico (`AI_HUB.md`, Capítulo 16, "Model
 * Registry"). Adaptado de `src/core/ai/ProviderCapabilities.ts` (AI Gateway legado, real e
 * funcional).
 */
export interface ProviderCapabilities {
  readonly streaming: boolean;
  readonly functionCalling: boolean;
  readonly maxTokens?: number;
  readonly models: readonly AIModelDescriptor[];
}
