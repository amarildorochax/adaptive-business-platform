import { BaseAIProvider } from "@/core/ai/BaseAIProvider";
import type { AIRequest } from "@/core/ai/AIRequest";
import type { AIResponse } from "@/core/ai/AIResponse";
import type { ProviderCapabilities } from "@/core/ai/ProviderCapabilities";
import { MockAIProvider } from "@/providers/mock/MockAIProvider";

/**
 * Provider da Anthropic (Claude).
 *
 * Nota (Tarefa 05 — implementação inicial): mesma natureza de
 * OpenAIProvider — a integração real com a API do Claude fica para uma
 * Sprint futura; `doGenerate()` delega internamente a MockAIProvider
 * apenas para exercitar a cadeia completa hoje. Nenhuma chamada de rede
 * é feita; nenhuma credencial é lida ou usada por este arquivo.
 *
 * Dependências: BaseAIProvider, MockAIProvider (delegação interna).
 */
export class ClaudeProvider extends BaseAIProvider {
  readonly id = "claude";

  private readonly mock = new MockAIProvider();

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const response = await this.mock.generate(request);

    return { ...response, provider: this.id };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      functionCalling: true,
      maxTokens: 200000,
      models: [
        { id: "claude-sonnet", provider: this.id, contextWindow: 200000 },
        { id: "claude-opus", provider: this.id, contextWindow: 200000 },
      ],
    };
  }
}
