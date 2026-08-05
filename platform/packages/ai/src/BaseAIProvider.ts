import type { AIProvider } from './AIProvider';
import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import type { ProviderCapabilities } from './ProviderCapabilities';

/**
 * Base AI Provider — classe base abstrata para todo Provider concreto, adaptada de
 * `src/core/ai/BaseAIProvider.ts` (AI Gateway legado, real e funcional): mede `latencyMs` de forma
 * consistente para toda subclasse, que implementa apenas `doGenerate()` e `getCapabilities()`, nunca
 * sobrescrevendo `generate()`.
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: string;

  async generate(request: AIRequest): Promise<AIResponse> {
    const startedAt = Date.now();
    const response = await this.doGenerate(request);

    return { ...response, latencyMs: Date.now() - startedAt };
  }

  protected abstract doGenerate(request: AIRequest): Promise<AIResponse>;

  abstract getCapabilities(): ProviderCapabilities;
}
