import type { AIRequest } from "./AIRequest";
import type { AIResponse } from "./AIResponse";
import type { ProviderCapabilities } from "./ProviderCapabilities";

/**
 * Contrato comum a qualquer provider de IA concreto — Mock, OpenAI,
 * Claude, Gemini (src/providers/*), e qualquer provider futuro.
 *
 * Responsabilidade: ser o único formato que AIProviderRegistry/
 * AIProviderFactory/AIRouter conhecem — nenhum deles sabe se está lidando
 * com MockAIProvider ou com um provider real.
 *
 * Dependências: AIRequest, AIResponse, ProviderCapabilities (tipos).
 *
 * Todo provider concreto deve estender BaseAIProvider (BaseAIProvider.ts)
 * em vez de implementar esta interface diretamente — é BaseAIProvider
 * quem garante a normalização de erro (AIError) e o `latencyMs` de toda
 * resposta.
 */
export interface AIProvider {
  readonly id: string;

  generate(request: AIRequest): Promise<AIResponse>;

  getCapabilities(): ProviderCapabilities;
}
