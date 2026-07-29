import { BaseAIProvider } from "@/core/ai/BaseAIProvider";
import type { AIRequest } from "@/core/ai/AIRequest";
import type { AIResponse } from "@/core/ai/AIResponse";
import type { ProviderCapabilities } from "@/core/ai/ProviderCapabilities";
import { MockAIProvider } from "@/providers/mock/MockAIProvider";

/**
 * Provider do Google (Gemini).
 *
 * Nota (Tarefa 05 — implementação inicial): mesma natureza de
 * OpenAIProvider/ClaudeProvider — a integração real com a API do Gemini
 * fica para uma Sprint futura; `doGenerate()` delega internamente a
 * MockAIProvider apenas para exercitar a cadeia completa hoje. Nenhuma
 * chamada de rede é feita; nenhuma credencial é lida ou usada por este
 * arquivo.
 *
 * Dependências: BaseAIProvider, MockAIProvider (delegação interna).
 */
export class GeminiProvider extends BaseAIProvider {
  readonly id = "gemini";

  private readonly mock = new MockAIProvider();

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const response = await this.mock.generate(request);

    return { ...response, provider: this.id };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      functionCalling: false,
      maxTokens: 1000000,
      models: [
        { id: "gemini-1.5-pro", provider: this.id, contextWindow: 1000000 },
        { id: "gemini-1.5-flash", provider: this.id, contextWindow: 1000000 },
      ],
    };
  }
}
