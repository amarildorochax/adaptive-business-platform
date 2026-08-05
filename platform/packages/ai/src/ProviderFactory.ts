import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import { MockAIProvider } from './MockAIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import type { AIProvider } from './AIProvider';
import { ProviderRegistry } from './ProviderRegistry';

/**
 * Provider Factory — instancia e configura o cliente técnico de cada Provider concreto, encapsulando
 * suas diferenças por trás de uma interface única (`AI_HUB.md`, Capítulo 7, "Provider Factory").
 * Adaptado de `src/core/ai/AIProviderFactory.ts` (legado, real e funcional) — seed inicial idêntica
 * ao legado: mock, openai, claude, gemini.
 */
export class ProviderFactory {
  private readonly registry = new ProviderRegistry();

  constructor() {
    this.registry.register(new MockAIProvider());
    this.registry.register(new OpenAIProvider());
    this.registry.register(new ClaudeProvider());
    this.registry.register(new GeminiProvider());
  }

  register(provider: AIProvider): void {
    this.registry.register(provider);
  }

  /** Localiza o Provider de `id`. Se `id` for ausente, ou não estiver registrado, retorna o MockAIProvider — garante que sempre existe um Provider funcional disponível. */
  create(id?: string): AIProvider {
    const providerId = id ?? 'mock';
    return this.registry.get(providerId) ?? this.registry.get('mock')!;
  }

  exists(id: string): boolean {
    return this.registry.exists(id);
  }

  list(): readonly AIProvider[] {
    return this.registry.list();
  }
}
