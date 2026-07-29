import type { AIRequest } from "./AIRequest";
import type { AIResponse } from "./AIResponse";
import { aiRouter } from "./AIRouter";
import { AIError, toAIError } from "./AIError";
import { aiMetrics } from "./AIMetrics";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/**
 * Ponto único de entrada de toda comunicação com modelos de IA da
 * plataforma (Tarefa 01).
 *
 * ```
 * Application
 *    ↓
 * AIGateway.generate(request)     ← único ponto de entrada
 *    ↓ valida request
 * AIRouter.resolve(request)       ← decide qual provider
 *    ↓
 * AIProviderFactory.create(id)    ← localiza/instancia o provider
 *    ↓
 * AIProvider.generate(request)    ← Mock, OpenAI, Claude, ou Gemini
 *    ↓
 * AIResponse padronizada          ← sempre o mesmo formato, ou AIError
 * ```
 *
 * Responsabilidade: nenhum módulo da plataforma deve importar
 * MockAIProvider/OpenAIProvider/ClaudeProvider/GeminiProvider,
 * AIProviderFactory, ou AIRouter diretamente — todos são detalhes de
 * implementação internos a esta camada. `BlogAgentExecutor`
 * (src/core/agents/blog/executor/) é o único consumidor hoje, e usa
 * exclusivamente `aiGateway.generate()`.
 *
 * Nesta chamada: valida a requisição, delega a seleção de provider a
 * AIRouter, converte qualquer erro em AIError (Tarefa 08), registra
 * métricas em AIMetrics e emite `AI_REQUEST_STARTED/COMPLETED/FAILED`
 * no EventBus (Tarefa 09), consumidos por Observability.ts.
 *
 * Dependências: AIRouter, AIError, AIMetrics, EventBus/EventTypes.
 *
 * Exemplo de uso:
 * ```ts
 * const response = await aiGateway.generate({ prompt: "Escreva um artigo sobre X." });
 * console.log(response.content, response.provider);
 * ```
 */
export class AIGateway {
  /**
   * Gera conteúdo a partir de `request`, através do provider que
   * AIRouter resolver.
   * @throws {AIError} sempre — nunca um erro específico de provider.
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    this.validate(request);

    const startedAt = Date.now();
    const provider = aiRouter.resolve(request);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AI_REQUEST_STARTED,
      source: "AIGateway",
      payload: { provider: provider.id, model: request.model },
      createdAt: new Date(),
    });

    try {
      const response = await provider.generate(request);

      const latencyMs = Date.now() - startedAt;

      aiMetrics.record({
        id: crypto.randomUUID(),
        provider: provider.id,
        success: true,
        latencyMs,
        tokenUsage: response.tokenUsage,
        recordedAt: new Date(),
      });

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AI_REQUEST_COMPLETED,
        source: "AIGateway",
        payload: {
          provider: provider.id,
          latencyMs,
          tokenUsage: response.tokenUsage,
        },
        createdAt: new Date(),
      });

      return response;
    } catch (error) {
      const aiError = toAIError(error, provider.id);
      const latencyMs = Date.now() - startedAt;

      aiMetrics.record({
        id: crypto.randomUUID(),
        provider: provider.id,
        success: false,
        latencyMs,
        errorCode: aiError.code,
        recordedAt: new Date(),
      });

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AI_REQUEST_FAILED,
        source: "AIGateway",
        payload: { provider: provider.id, code: aiError.code, message: aiError.message },
        createdAt: new Date(),
      });

      throw aiError;
    }
  }

  /** Validação estrutural mínima — nunca regra de negócio de nenhum domínio consumidor. */
  private validate(request: AIRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new AIError({
        code: "INVALID_REQUEST",
        message: "AIRequest.prompt não pode ser vazio.",
      });
    }
  }
}

/** Instância única e compartilhada do AIGateway para toda a plataforma. */
export const aiGateway = new AIGateway();
