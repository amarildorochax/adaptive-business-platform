import type { AIProvider } from "./AIProvider";
import type { AIRequest } from "./AIRequest";
import type { AIResponse } from "./AIResponse";
import type { ProviderCapabilities } from "./ProviderCapabilities";
import { toAIError } from "./AIError";

/**
 * Classe base abstrata para todo AIProvider concreto (Tarefa 04).
 *
 * Responsabilidade: implementar o comportamento comum a qualquer
 * provider — medir `latencyMs` e normalizar qualquer erro lançado para
 * AIError (Tarefa 08) — para que nenhuma subclasse precise reimplementar
 * isso individualmente.
 *
 * Cada subclasse implementa apenas `doGenerate()` (a chamada real ao
 * provider) e `getCapabilities()`; nunca sobrescreve `generate()`.
 *
 * Exemplo de uso:
 * ```ts
 * export class MyProvider extends BaseAIProvider {
 *   readonly id = "my-provider";
 *   protected async doGenerate(request: AIRequest): Promise<AIResponse> { ... }
 *   getCapabilities(): ProviderCapabilities { ... }
 * }
 * ```
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: string;

  /**
   * Chama `doGenerate()`, mede o tempo decorrido, e converte qualquer
   * erro lançado em AIError antes de propagá-lo — nunca deixa um erro
   * específico de provider escapar desta camada.
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const startedAt = Date.now();

    try {
      const response = await this.doGenerate(request);

      return {
        ...response,
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      throw toAIError(error, this.id);
    }
  }

  /** Lógica real de geração de conteúdo — implementada por cada provider concreto. */
  protected abstract doGenerate(request: AIRequest): Promise<AIResponse>;

  abstract getCapabilities(): ProviderCapabilities;
}
