import type { MemoryRecord } from "./MemoryRecord";
import type { MemoryCategory } from "./MemoryCategory";
import { MemoryManager, type MemoryRecordInput } from "./MemoryManager";
import type { MemoryMetricsSnapshot } from "./MemoryMetrics";

/**
 * Serviço centralizado de memória empresarial — o único ponto de
 * entrada para armazenar, recuperar, atualizar, remover, e pesquisar
 * informação estratégica na plataforma (Tarefa 01).
 *
 * ```
 * Application (ContextBuilder, e futuramente qualquer Agent/Módulo)
 *    ↓
 * BusinessMemory                  ← único ponto de entrada
 *    ↓
 * MemoryManager                   ← CRUD, versionamento, eventos, métricas
 *    ↓                ↓
 * MemoryStore     MemoryIndex     ← armazenamento em RAM / busca
 * ```
 *
 * Responsabilidade: nenhum Agente ou módulo deve manter contexto
 * permanente localmente — toda informação estratégica passa por aqui.
 * Nenhum consumidor deve importar MemoryManager/MemoryStore/MemoryIndex
 * diretamente; `BusinessMemory` é a única fachada pública deste
 * subsistema (mesmo princípio já aplicado ao AI Gateway na Sprint
 * anterior — nenhum módulo fala com um provider diretamente).
 *
 * Dependências: MemoryManager (interno, único).
 *
 * Exemplo de uso:
 * ```ts
 * const record = businessMemory.store({ category: MemoryCategory.BLOG, title: "Tom de voz", content: "...", tags: ["blog"], metadata: {} });
 * businessMemory.searchByCategory(MemoryCategory.BLOG);
 * businessMemory.update(record.id, { content: "..." });
 * businessMemory.remove(record.id);
 * ```
 */
export class BusinessMemory {
  private readonly manager = new MemoryManager();

  /** Armazena uma nova informação estratégica. */
  store(input: MemoryRecordInput): MemoryRecord {
    return this.manager.create(input);
  }

  /** Recupera uma informação por `id`, ou `undefined` se não existir. */
  retrieve(id: string): MemoryRecord | undefined {
    return this.manager.get(id);
  }

  /** Atualiza o contexto de uma informação já armazenada (parcial). */
  update(id: string, input: Partial<MemoryRecordInput>): MemoryRecord | undefined {
    return this.manager.update(id, input);
  }

  /** Remove uma informação. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.manager.remove(id);
  }

  /** Retorna toda a memória empresarial já armazenada. */
  getAll(): MemoryRecord[] {
    return this.manager.getAll();
  }

  /** Pesquisa por categoria (Tarefa 05). */
  searchByCategory(category: MemoryCategory): MemoryRecord[] {
    return this.manager.searchByCategory(category);
  }

  /** Pesquisa por tags (ao menos uma correspondência). */
  searchByTags(tags: string[]): MemoryRecord[] {
    return this.manager.searchByTags(tags);
  }

  /** Pesquisa textual livre em título e conteúdo. */
  searchByText(query: string): MemoryRecord[] {
    return this.manager.searchByText(query);
  }

  /** Métricas agregadas de uso do Business Memory (Tarefa 09). */
  getMetrics(): MemoryMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do BusinessMemory para toda a plataforma. */
export const businessMemory = new BusinessMemory();
