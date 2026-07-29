import type { AIProvider } from "./AIProvider";

/**
 * Registro central de AIProvider disponíveis, indexado por `id`
 * (Tarefa 07 — Sistema de Registro de Providers).
 *
 * Responsabilidade: manter o cadastro de providers já conhecidos e
 * permitir sua consulta genérica — o mesmo papel que AgentRegistry
 * cumpre para Agent, ModuleRegistry para IModule, e ConnectorRegistry
 * para IConnector.
 *
 * Consumido internamente por AIProviderFactory — nenhum outro
 * componente deve manter sua própria instância de AIProviderRegistry.
 *
 * Dependências: AIProvider (tipo).
 */
export class AIProviderRegistry {
  private providers = new Map<string, AIProvider>();

  /** Registra (ou substitui, se já existir o mesmo `id`) um provider. */
  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  /** Remove o provider de `id` do registro, se existir. */
  remove(id: string): void {
    this.providers.delete(id);
  }

  /** Retorna o provider de `id`, ou `undefined` se não estiver registrado. */
  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  /** Retorna todos os providers já registrados. */
  list(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /** `true` se um provider de `id` já estiver registrado. */
  exists(id: string): boolean {
    return this.providers.has(id);
  }
}
