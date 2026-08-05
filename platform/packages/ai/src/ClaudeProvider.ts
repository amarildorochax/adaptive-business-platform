import { BaseAIProvider } from './BaseAIProvider';
import { MockAIProvider } from './MockAIProvider';
import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import type { ProviderCapabilities } from './ProviderCapabilities';

/**
 * Claude Provider — adaptado de `src/providers/claude/ClaudeProvider.ts` (legado, real e
 * funcional). Mesmo tratamento de `OpenAIProvider.ts`: `doGenerate()` delega inteiramente a
 * `MockAIProvider`, nenhuma chamada de rede, nenhuma credencial.
 */
export class ClaudeProvider extends BaseAIProvider {
  readonly id = 'claude';

  private readonly mock = new MockAIProvider();

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const response = await this.mock.generate(request);
    return { ...response, providerId: this.id };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      functionCalling: true,
      maxTokens: 200000,
      models: [{ id: 'claude-sonnet', providerId: this.id, contextWindow: 200000 }],
    };
  }
}
