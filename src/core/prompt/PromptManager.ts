import type { AIResponse } from "@/core/ai";
import { contextBuilder } from "@/core/memory/ContextBuilder";
import { PromptRegistry, type PromptRecordInput } from "./PromptRegistry";
import { PromptBuilder } from "./PromptBuilder";
import { PromptMetrics, type PromptMetricsSnapshot } from "./PromptMetrics";
import type { PromptRecord } from "./PromptRecord";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/** Requisição de geração de prompt aceita por `PromptManager.generate()`. */
export interface PromptRequest {
  /** Id de um PromptTemplate já registrado (ex.: `"template-blog"`) — tem prioridade sobre `systemPrompt`. */
  templateId?: string;

  /** System Prompt direto, usado apenas quando `templateId` não é informado. */
  systemPrompt?: string;

  /** Instrução real da tarefa. Sempre obrigatório. */
  userPrompt: string;

  /** Ferramentas disponíveis ao Agent nesta chamada — apenas descritivo. */
  tools?: string[];

  /** Valores para substituição simples de `{{key}}` (ver PromptBuilder). */
  variables?: Record<string, string>;

  /** Repassado ao ContextBuilder — tipicamente `{ category, tags }` (ver BusinessMemory, Sprint anterior). */
  metadata?: Record<string, unknown>;
}

/**
 * Fachada pública única do Prompt Manager (Tarefa 01).
 *
 * ```
 * Agent (ex.: BlogAgentExecutor)
 *    ↓
 * PromptManager.generate(request)     ← único ponto de entrada
 *    ↓ resolve template (se templateId informado)
 * PromptBuilder.build(...)            ← monta System+User+Tools, substitui {{variáveis}}
 *    ↓
 * ContextBuilder.generate(prompt)     ← Business Memory (inalterada) + AI Gateway (inalterado)
 *    ↓
 * AIResponse
 * ```
 *
 * Responsabilidade: nenhum Agent deve montar prompt manualmente, nem
 * chamar `contextBuilder`/`aiGateway` diretamente para gerar conteúdo —
 * todos usam exclusivamente `promptManager.generate()`. É este método
 * quem decide o template, monta o texto final, e só então encaminha ao
 * ContextBuilder já existente — nunca à Business Memory ou ao AI
 * Gateway diretamente (ambos permanecem inalterados e são consumidos
 * apenas através de suas APIs públicas já existentes).
 *
 * Também expõe o CRUD de templates (`registerTemplate`/`getTemplate`/
 * `listTemplates`/`updateTemplate`/`removeTemplate`) como fachada sobre
 * PromptRegistry — nenhum consumidor externo deve importar
 * PromptRegistry diretamente.
 *
 * Dependências: PromptRegistry, PromptBuilder, PromptMetrics,
 * ContextBuilder (público, inalterado), EventBus/EventTypes.
 *
 * Exemplo de uso:
 * ```ts
 * const response = await promptManager.generate({
 *   templateId: "template-blog",
 *   userPrompt: "Escreva um artigo sobre X.",
 *   variables: { businessName: "Andreia Rocha Floral", tone: "acolhedor" },
 *   metadata: { category: MemoryCategory.BLOG },
 * });
 * ```
 */
export class PromptManager {
  private readonly registry = new PromptRegistry();

  private readonly builder = new PromptBuilder();

  private readonly metrics = new PromptMetrics();

  /**
   * Gera um prompt completo e o encaminha ao ContextBuilder.
   * @throws {Error} se `templateId` for informado mas não estiver registrado.
   */
  async generate(request: PromptRequest): Promise<AIResponse> {
    const createdAt = new Date();

    let systemPrompt = request.systemPrompt;

    if (request.templateId) {
      const template = this.registry.get(request.templateId);

      if (!template) {
        throw new Error(`PromptManager: template "${request.templateId}" não está registrado.`);
      }

      systemPrompt = template.content;
    }

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.PROMPT_CREATED,
      source: "PromptManager",
      payload: { templateId: request.templateId },
      createdAt,
    });

    const startedAt = Date.now();

    const composed = this.builder.build({
      systemPrompt,
      userPrompt: request.userPrompt,
      tools: request.tools,
      variables: request.variables,
      metadata: request.metadata,
    });

    const buildTimeMs = Date.now() - startedAt;

    this.metrics.recordGeneration(composed.prompt.length, buildTimeMs, request.templateId);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.PROMPT_RENDERED,
      source: "PromptManager",
      payload: { templateId: request.templateId, length: composed.prompt.length, buildTimeMs },
      createdAt: new Date(),
    });

    return contextBuilder.generate({
      prompt: composed.prompt,
      metadata: composed.metadata,
    });
  }

  /** Registra um novo template/PromptRecord — ver PromptRegistry.register(). */
  registerTemplate(input: PromptRecordInput): PromptRecord {
    return this.registry.register(input);
  }

  /** Localiza um template/PromptRecord por `id`. */
  getTemplate(id: string): PromptRecord | undefined {
    return this.registry.get(id);
  }

  /** Lista todos os templates/PromptRecord já registrados. */
  listTemplates(): PromptRecord[] {
    return this.registry.list();
  }

  /** Atualiza um template/PromptRecord já registrado (parcial). */
  updateTemplate(id: string, input: Partial<PromptRecordInput>): PromptRecord | undefined {
    return this.registry.update(id, input);
  }

  /** Remove um template/PromptRecord. */
  removeTemplate(id: string): boolean {
    return this.registry.remove(id);
  }

  /** Métricas agregadas de uso do Prompt Manager (Tarefa 07). */
  getMetrics(): PromptMetricsSnapshot {
    return this.metrics.snapshot();
  }
}

/** Instância única e compartilhada do PromptManager para toda a plataforma. */
export const promptManager = new PromptManager();
