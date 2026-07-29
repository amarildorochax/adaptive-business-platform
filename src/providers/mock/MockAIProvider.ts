import { BaseAIProvider } from "@/core/ai/BaseAIProvider";
import type { AIRequest } from "@/core/ai/AIRequest";
import type { AIResponse } from "@/core/ai/AIResponse";
import type { ProviderCapabilities } from "@/core/ai/ProviderCapabilities";

/** Estimativa grosseira de tokens por comprimento de texto — apenas para demonstrar AITokenUsage, nunca cobrado. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Implementação de AIProvider que não faz nenhuma chamada externa —
 * gera um conteúdo fixo de demonstração após um atraso artificial.
 *
 * Responsabilidade: validar toda a cadeia AIGateway -> AIRouter ->
 * AIProviderFactory -> Provider de ponta a ponta, sem depender de
 * chave de API real. É também o provider interno usado por
 * OpenAIProvider/ClaudeProvider/GeminiProvider enquanto a integração
 * real de cada um não é implementada (ver seus próprios arquivos).
 *
 * Dependências: BaseAIProvider, e os tipos de AIRequest/AIResponse/
 * ProviderCapabilities.
 */
export class MockAIProvider extends BaseAIProvider {
  readonly id = "mock";

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const content = `
# Artigo de Demonstração

Este conteúdo foi gerado pelo MockAIProvider.

Prompt recebido:

${request.prompt}

Este provider existe apenas para validar toda a arquitetura da Andreia AI Platform antes da integração real com OpenAI, Claude e Gemini.
`.trim();

    return {
      success: true,
      provider: this.id,
      model: request.model ?? "mock-1",
      createdAt: new Date(),
      content,
      tokenUsage: {
        promptTokens: estimateTokens(request.prompt),
        completionTokens: estimateTokens(content),
        totalTokens: estimateTokens(request.prompt) + estimateTokens(content),
      },
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: false,
      functionCalling: false,
      models: [{ id: "mock-1", provider: this.id }],
    };
  }
}
