import { BaseAIProvider } from './BaseAIProvider';
import { MockAIProvider } from './MockAIProvider';
import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import type { ProviderCapabilities } from './ProviderCapabilities';

/**
 * OpenAI Provider — adaptado de `src/providers/openai/OpenAIProvider.ts` (legado, real e funcional).
 * A integração real com a API da OpenAI (chamada HTTP, chave de API) está fora do escopo desta
 * Sprint, regra explícita — `doGenerate()` delega inteiramente a `MockAIProvider`, apenas para que
 * toda a cadeia AI Gateway → Provider Router → Provider Factory → OpenAIProvider já funcione de
 * ponta a ponta, com `providerId` da resposta corretamente identificado como `"openai"`. Nenhuma
 * chamada de rede é feita; nenhuma credencial é lida ou usada por este arquivo.
 */
export class OpenAIProvider extends BaseAIProvider {
  readonly id = 'openai';

  private readonly mock = new MockAIProvider();

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const response = await this.mock.generate(request);
    return { ...response, providerId: this.id };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      functionCalling: true,
      maxTokens: 128000,
      models: [
        { id: 'gpt-4o', providerId: this.id, contextWindow: 128000 },
        { id: 'gpt-4o-mini', providerId: this.id, contextWindow: 128000 },
      ],
    };
  }
}
