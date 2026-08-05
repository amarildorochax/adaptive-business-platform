import type { AIProvider } from './AIProvider';
import type { AIRequest } from './AIRequest';
import { ProviderFactory } from './ProviderFactory';

/**
 * Provider Router — decide qual Provider atende uma AI Request (`AI_HUB.md`, Capítulo 7, "Provider
 * Manager"). Adaptado de `src/core/ai/AIRouter.ts` (legado, real e funcional) — regra idêntica:
 * prioridade a `request.providerId`; na ausência, usa o Provider padrão da plataforma (`"mock"`
 * nesta Sprint — o legado consultava uma variável de ambiente de configuração, um componente de
 * infraestrutura explicitamente fora do escopo desta Sprint).
 *
 * Roteamento sofisticado por capacidade, custo ou política (`AI_HUB.md`, Capítulo 7, "Provider
 * Manager" completo) é "médio/longo prazo" per o Roadmap do próprio Blueprint (Capítulo 25) — esta
 * Sprint implementa apenas a espinha dorsal de curto prazo.
 */
export class ProviderRouter {
  constructor(private readonly factory: ProviderFactory) {}

  resolve(request: AIRequest): AIProvider {
    const providerId = request.providerId ?? 'mock';

    if (!this.factory.exists(providerId)) {
      throw new Error(`Provider "${providerId}" não está registrado na Provider Factory.`);
    }

    return this.factory.create(providerId);
  }
}
