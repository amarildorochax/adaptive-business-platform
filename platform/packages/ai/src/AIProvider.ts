import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import type { ProviderCapabilities } from './ProviderCapabilities';

/**
 * AI Provider — o contrato comum a qualquer Provider concreto (Mock, OpenAI, Claude, Gemini, e
 * qualquer Provider futuro), adaptado de `src/core/ai/AIProvider.ts` (AI Gateway legado, real e
 * funcional). Nenhum componente acima da Provider Factory conhece qual implementação concreta está
 * por trás desta interface (`AI_HUB.md`, Capítulo 6, "Troca transparente de Provider").
 */
export interface AIProvider {
  readonly id: string;
  generate(request: AIRequest): Promise<AIResponse>;
  getCapabilities(): ProviderCapabilities;
}
