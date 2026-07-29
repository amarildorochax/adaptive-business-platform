import type { AIRequest, AIResponse } from "@/core/ai";
import { aiGateway } from "@/core/ai";
import { businessMemory } from "./BusinessMemory";
import type { MemoryCategory } from "./MemoryCategory";
import type { MemoryRecord } from "./MemoryRecord";

/** Quantidade máxima de MemoryRecord anexados a uma única AIRequest — evita crescimento ilimitado do prompt. */
const MAX_CONTEXT_RECORDS = 5;

/**
 * Ponte entre o Business Memory e o AI Gateway (Tarefa 06).
 *
 * ```
 * AIRequest
 *    ↓
 * ContextBuilder.generate(request)
 *    ↓ consulta BusinessMemory (por request.metadata.category, ou .tags, ou geral)
 *    ↓ monta contexto (prepende ao prompt original)
 * AIGateway.generate(requestEnriquecida)
 *    ↓
 * AIResponse
 * ```
 *
 * Responsabilidade: ser o único lugar que combina memória empresarial
 * com uma chamada de IA — nenhum Agente deve consultar BusinessMemory e
 * AIGateway separadamente; todos devem chamar `contextBuilder.generate()`
 * (ver BlogAgentExecutor.ts, Tarefa 10).
 *
 * Seleção de contexto (heurística simples, sem regra de negócio):
 * `request.metadata.category` tem prioridade; na ausência dele,
 * `request.metadata.tags`; na ausência de ambos, os registros mais
 * recentes em geral, até `MAX_CONTEXT_RECORDS`. Se o Business Memory
 * estiver vazio (caso comum hoje — nenhuma Sprint ainda popula memória
 * real), a requisição segue adiante sem nenhum contexto adicional —
 * comportamento idêntico ao de antes desta Sprint.
 *
 * Dependências: AIGateway (nunca alterado, apenas consumido), BusinessMemory.
 */
export class ContextBuilder {
  /** Consulta o Business Memory, monta o contexto, e encaminha ao AI Gateway. */
  async generate(request: AIRequest): Promise<AIResponse> {
    const records = this.selectContext(request);

    if (records.length === 0) {
      return aiGateway.generate(request);
    }

    const contextBlock = this.buildContextBlock(records);

    return aiGateway.generate({
      ...request,
      prompt: `${contextBlock}\n\n${request.prompt}`,
    });
  }

  private selectContext(request: AIRequest): MemoryRecord[] {
    const category = request.metadata?.category as MemoryCategory | undefined;

    if (category) {
      return businessMemory.searchByCategory(category).slice(0, MAX_CONTEXT_RECORDS);
    }

    const tags = request.metadata?.tags as string[] | undefined;

    if (tags && tags.length > 0) {
      return businessMemory.searchByTags(tags).slice(0, MAX_CONTEXT_RECORDS);
    }

    return businessMemory.getAll().slice(0, MAX_CONTEXT_RECORDS);
  }

  private buildContextBlock(records: MemoryRecord[]): string {
    const entries = records
      .map((record) => `- ${record.title}: ${record.content}`)
      .join("\n");

    return `Contexto institucional (Business Memory):\n${entries}`;
  }
}

/** Instância única e compartilhada do ContextBuilder para toda a plataforma. */
export const contextBuilder = new ContextBuilder();
