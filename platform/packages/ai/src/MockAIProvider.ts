import { BaseAIProvider } from './BaseAIProvider';
import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import type { ProviderCapabilities } from './ProviderCapabilities';

/** Estimativa grosseira de tokens por comprimento de texto — apenas informativo, nunca cobrado. Adaptado de `src/providers/mock/MockAIProvider.ts` (legado, real e funcional). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Mock AI Provider — a única implementação real de `AIProvider` nesta Sprint. Adaptado de
 * `src/providers/mock/MockAIProvider.ts` (legado, real e funcional, zero chamada de rede, zero
 * credencial lida) — nenhuma integração real com OpenAI/Anthropic/Google/Azure/Ollama/OpenRouter
 * existe nesta Sprint, regra explícita desta Sprint. Valida toda a cadeia AI Gateway → Provider
 * Router → Provider Factory → Provider de ponta a ponta, sem depender de nenhuma chave de API real.
 *
 * Diferente do legado, esta versão nunca introduz atraso artificial (`setTimeout`) — a demonstração
 * de latência não é uma exigência arquitetural, apenas um adorno do legado; removê-la mantém a
 * suíte de teste desta Sprint rápida sem alterar nenhum comportamento observável relevante.
 */
export class MockAIProvider extends BaseAIProvider {
  readonly id = 'mock';

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const content = [
      '# Conteúdo de Demonstração',
      '',
      'Este conteúdo foi gerado pelo MockAIProvider.',
      '',
      'Prompt recebido:',
      '',
      request.prompt,
      '',
      'Este provider existe apenas para validar toda a arquitetura do AI Hub antes de qualquer integração real.',
    ].join('\n');

    return {
      success: true,
      providerId: this.id,
      model: request.model ?? 'mock-1',
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
      models: [{ id: 'mock-1', providerId: this.id }],
    };
  }
}
