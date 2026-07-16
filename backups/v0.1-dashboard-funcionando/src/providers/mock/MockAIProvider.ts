import type {
  AIProvider,
  AIRequest,
  AIResponse,
} from "@/core/ai/AIProvider";

export class MockAIProvider implements AIProvider {
  async generate(
    request: AIRequest
  ): Promise<AIResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      provider: "MockAI",
      createdAt: new Date(),
      content: `
# Artigo de Demonstração

Este conteúdo foi gerado pelo MockAIProvider.

Prompt recebido:

${request.prompt}

Este provider existe apenas para validar toda a arquitetura da Andreia AI Platform antes da integração com OpenAI e Claude.
`.trim(),
    };
  }
}