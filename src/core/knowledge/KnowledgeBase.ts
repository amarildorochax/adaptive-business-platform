import type { KnowledgeDocument } from "./KnowledgeDocument";
import { KnowledgeManager, type KnowledgeDocumentInput } from "./KnowledgeManager";
import type { KnowledgeMetricsSnapshot } from "./KnowledgeMetrics";

/**
 * Repositório oficial de conhecimento institucional da plataforma —
 * fachada pública única do Knowledge Base (Tarefa 01/02).
 *
 * ```
 * Application
 *    ↓
 * KnowledgeBase.createDocument/updateDocument/removeDocument/getDocument/list/search   ← único ponto de entrada
 *    ↓
 * KnowledgeManager             ← CRUD, versionamento, eventos, métricas
 *    ↓                    ↓
 * KnowledgeStore      KnowledgeSearch → KnowledgeIndex
 * ```
 *
 * Knowledge Base **não é** Business Memory: Business Memory
 * (`@/core/memory`, inalterada) representa memória **operacional** —
 * contexto de curto prazo que ContextBuilder injeta em uma chamada de
 * IA específica; Knowledge Base representa conhecimento
 * **institucional permanente** — produtos, serviços, FAQ, manuais,
 * processos, políticas, scripts, treinamentos. As duas taxonomias
 * (`KnowledgeCategory` vs. `MemoryCategory`) são deliberadamente
 * paralelas, nunca compartilhadas.
 *
 * Responsabilidade: nenhum outro componente deve acessar
 * `KnowledgeManager`/`KnowledgeStore`/`KnowledgeSearch` diretamente —
 * apenas esta fachada. Consumida hoje apenas por `KnowledgeProvider`
 * (ver KnowledgeProvider.ts) — o ponto oficial, mas ainda não
 * conectado, de integração futura com Business Memory.
 *
 * Dependências: KnowledgeManager (interno, único).
 *
 * Exemplo de uso:
 * ```ts
 * const doc = knowledgeBase.createDocument({
 *   title: "Política de Trocas", content: "...", summary: "...",
 *   category: KnowledgeCategory.SUPPORT, tags: ["politica"], metadata: {},
 *   status: KnowledgeStatus.PUBLISHED,
 * });
 * knowledgeBase.search("trocas");
 * ```
 */
export class KnowledgeBase {
  private readonly manager = new KnowledgeManager();

  /** Cria um novo documento de conhecimento. */
  createDocument(input: KnowledgeDocumentInput): KnowledgeDocument {
    return this.manager.createDocument(input);
  }

  /** Atualiza um documento já existente (parcial). */
  updateDocument(id: string, input: Partial<KnowledgeDocumentInput>): KnowledgeDocument | undefined {
    return this.manager.updateDocument(id, input);
  }

  /** Remove um documento. Retorna `false` se não existir. */
  removeDocument(id: string): boolean {
    return this.manager.removeDocument(id);
  }

  /** Recupera um documento por `id`, ou `undefined` se não existir. */
  getDocument(id: string): KnowledgeDocument | undefined {
    return this.manager.getDocument(id);
  }

  /** Retorna todo o conhecimento já armazenado. */
  list(): KnowledgeDocument[] {
    return this.manager.list();
  }

  /** Pesquisa textual livre em título e conteúdo. */
  search(query: string): KnowledgeDocument[] {
    return this.manager.search(query);
  }

  /** Métricas agregadas de uso do Knowledge Base (Tarefa 09/11). */
  getMetrics(): KnowledgeMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do KnowledgeBase para toda a plataforma. */
export const knowledgeBase = new KnowledgeBase();
