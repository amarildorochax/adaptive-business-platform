import { BaseAIProvider } from "@/core/ai/BaseAIProvider";
import type { AIRequest } from "@/core/ai/AIRequest";
import type { AIResponse } from "@/core/ai/AIResponse";
import type { ProviderCapabilities } from "@/core/ai/ProviderCapabilities";
import { MockAIProvider } from "@/providers/mock/MockAIProvider";

/**
 * Provider da OpenAI.
 *
 * Nota (Tarefa 05 — implementação inicial): a integração real com a API
 * da OpenAI (chamada HTTP, chave de API, Prompt Manager, Context Engine)
 * está fora do escopo desta Sprint — `doGenerate()` delega internamente
 * a MockAIProvider, apenas para que toda a cadeia AIGateway -> AIRouter
 * -> AIProviderFactory -> OpenAIProvider já funcione de ponta a ponta
 * hoje, com o `provider` da resposta corretamente identificado como
 * `"openai"`. Nenhuma chamada de rede é feita; nenhuma credencial é lida
 * ou usada por este arquivo.
 *
 * Dependências: BaseAIProvider, MockAIProvider (delegação interna).
 */
export class OpenAIProvider extends BaseAIProvider {
  readonly id = "openai";

  private readonly mock = new MockAIProvider();

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const response = await this.mock.generate(request);

    return { ...response, provider: this.id };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      functionCalling: true,
      maxTokens: 128000,
      models: [
        { id: "gpt-4o", provider: this.id, contextWindow: 128000 },
        { id: "gpt-4o-mini", provider: this.id, contextWindow: 128000 },
      ],
    };
  }
}
