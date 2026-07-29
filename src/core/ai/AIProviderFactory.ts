import type { AIProvider } from "./AIProvider";
import { AIProviderRegistry } from "./AIProviderRegistry";
import { MockAIProvider } from "@/providers/mock/MockAIProvider";
import { OpenAIProvider } from "@/providers/openai/OpenAIProvider";
import { ClaudeProvider } from "@/providers/claude/ClaudeProvider";
import { GeminiProvider } from "@/providers/gemini/GeminiProvider";

/**
 * Fábrica de AIProvider — localiza e permite registrar providers,
 * apoiada em um AIProviderRegistry interno (Tarefa 03 — Expandir
 * AIProviderFactory; Tarefa 07 — Registro de Providers).
 *
 * Responsabilidade: ser o único lugar que conhece a lista concreta de
 * providers já disponíveis. Consumida exclusivamente por AIRouter —
 * nenhum outro componente deve chamar `create()` diretamente.
 *
 * Objetivo: permitir a inclusão de um novo provider (ex.: um futuro
 * `LlamaProvider`) apenas chamando `register()`, sem alterar nenhuma
 * estrutura existente — mesmo princípio já usado por AgentRegistry/
 * ModuleRegistry/ConnectorRegistry.
 *
 * Seed inicial (construtor): mock, openai, claude, gemini — os quatro
 * já exigidos por esta Sprint.
 *
 * Dependências: AIProviderRegistry, e os quatro providers concretos de
 * `@/providers/*`.
 */
export class AIProviderFactory {
  private readonly registry = new AIProviderRegistry();

  constructor() {
    this.registry.register(new MockAIProvider());
    this.registry.register(new OpenAIProvider());
    this.registry.register(new ClaudeProvider());
    this.registry.register(new GeminiProvider());
  }

  /** Registra (ou substitui) um provider — ponto de extensão para providers futuros. */
  register(provider: AIProvider): void {
    this.registry.register(provider);
  }

  /**
   * Localiza o provider de `id`. Se `id` não for informado, ou não
   * estiver registrado, retorna o MockAIProvider (`"mock"`) — garante
   * que sempre existe um provider funcional disponível.
   */
  create(id?: string): AIProvider {
    const providerId = id ?? "mock";

    return this.registry.get(providerId) ?? this.registry.get("mock")!;
  }

  /** `true` se um provider de `id` já estiver registrado. */
  exists(id: string): boolean {
    return this.registry.exists(id);
  }

  /** Retorna todos os providers já registrados. */
  list(): AIProvider[] {
    return this.registry.list();
  }
}

/** Instância única e compartilhada do AIProviderFactory para toda a plataforma. */
export const aiProviderFactory = new AIProviderFactory();
