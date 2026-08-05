import type { AIRequest } from './AIRequest';
import type { AIResponse } from './AIResponse';
import { ProviderRouter } from './ProviderRouter';

/**
 * AI Gateway — o único ponto de entrada do AI Hub (`AI_HUB.md`, Capítulo 7): "validar a solicitação,
 * identificar o módulo e a empresa de origem, aplicar as primeiras verificações de autorização, e
 * encaminhar a solicitação ao restante do pipeline interno... não compõe prompts, não decide qual
 * provedor será usado e não processa lógica de negócio". Adaptado de `src/core/ai/AIGateway.ts`
 * (legado, real e funcional) — validação estrutural mínima, delega roteamento inteiramente ao
 * Provider Router, nunca decide ele mesmo qual Provider atende a solicitação.
 *
 * Nenhum módulo de negócio, em nenhuma circunstância, atravessa diretamente para a Provider Layer —
 * todo consumidor desta Sprint (o AIManager) chama exclusivamente `AIGateway.generate()`.
 */
export class AIGateway {
  constructor(private readonly router: ProviderRouter) {}

  async generate(request: AIRequest): Promise<AIResponse> {
    this.validate(request);

    const provider = this.router.resolve(request);
    return provider.generate(request);
  }

  private validate(request: AIRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('AIRequest.prompt não pode ser vazio.');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('AIRequest.tenantId não pode ser vazio — isolamento absoluto entre Empresas (AI_HUB.md, ADR-008).');
    }
  }
}
