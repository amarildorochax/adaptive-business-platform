import type { AIProvider } from './AIProvider';

/**
 * Provider Registry — o registro central de Provider disponíveis, indexado por `id`. Adaptado de
 * `src/core/ai/AIProviderRegistry.ts` (legado, real e funcional). Consumido exclusivamente pela
 * Provider Factory.
 */
export class ProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  list(): readonly AIProvider[] {
    return [...this.providers.values()];
  }

  exists(id: string): boolean {
    return this.providers.has(id);
  }
}
