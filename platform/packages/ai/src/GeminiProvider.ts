import { BaseAIProvider } from './BaseAIProvider';
import { MockAIProvider } from './MockAIProvider';
import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import type { ProviderCapabilities } from './ProviderCapabilities';

/**
 * Gemini Provider — adaptado de `src/providers/gemini/GeminiProvider.ts` (legado, real e
 * funcional). Mesmo tratamento de `OpenAIProvider.ts`/`ClaudeProvider.ts`: `doGenerate()` delega
 * inteiramente a `MockAIProvider`, nenhuma chamada de rede, nenhuma credencial. DeepSeek, Ollama e
 * Azure OpenAI — os três demais Provider já nomeados em `AI_HUB.md`, Capítulo 15 — nunca chegaram a
 * ser estubados nem no próprio legado, e não são adicionados por esta Sprint (ver relatório).
 */
export class GeminiProvider extends BaseAIProvider {
  readonly id = 'gemini';

  private readonly mock = new MockAIProvider();

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const response = await this.mock.generate(request);
    return { ...response, providerId: this.id };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      functionCalling: false,
      maxTokens: 1000000,
      models: [{ id: 'gemini-1.5-pro', providerId: this.id, contextWindow: 1000000 }],
    };
  }
}
