import type { KnowledgeDocument } from "./KnowledgeDocument";
import type { KnowledgeCategory } from "./KnowledgeCategory";
import { KnowledgeStatus } from "./KnowledgeStatus";
import { knowledgeBase } from "./KnowledgeBase";

/** Filtro opcional aceito por `KnowledgeProvider.provide()`. */
export interface KnowledgeProviderQuery {
  category?: KnowledgeCategory;
  text?: string;
}

/**
 * Ponto oficial de integração entre Knowledge Base e o restante da
 * plataforma (Tarefa 09/10) — hoje apenas Business Memory é citada como
 * futura consumidora, mas nenhuma delas é alterada nesta Sprint.
 *
 * Responsabilidade: ser o **único** lugar que, futuramente, Business
 * Memory (ou Prompt Manager, CRM, Marketing, Financeiro, Dashboard,
 * Workflow Engine, AI Gateway) consultaria para obter conhecimento
 * institucional já filtrado e publicado — nenhum desses módulos deve
 * importar `KnowledgeBase`/`KnowledgeManager` diretamente quando essa
 * integração for de fato construída.
 *
 * Nesta Sprint, `provide()` já consulta o KnowledgeBase real (filtrando
 * por `KnowledgeStatus.PUBLISHED`, e por `category`/`text` quando
 * informados) — não é um stub hardcoded — mas, como nenhum documento é
 * semeado nesta Sprint e nenhum consumidor (Business Memory ou
 * qualquer outro) ainda o chama, o retorno observável hoje é sempre uma
 * coleção vazia, exatamente como esta Sprint antecipa. Nenhuma chamada
 * a `BusinessMemory`/`PromptManager`/`AIGateway` é feita por este
 * arquivo — nenhum dos três é importado aqui.
 *
 * Dependências: KnowledgeBase (interno, único), KnowledgeStatus (tipo).
 */
export class KnowledgeProvider {
  /**
   * Retorna os documentos já `PUBLISHED`, opcionalmente filtrados por
   * `category` e/ou por busca textual (`text`).
   */
  async provide(query?: KnowledgeProviderQuery): Promise<KnowledgeDocument[]> {
    const source = query?.text ? knowledgeBase.search(query.text) : knowledgeBase.list();

    return source.filter((document) => {
      const isPublished = document.status === KnowledgeStatus.PUBLISHED;
      const matchesCategory = !query?.category || document.category === query.category;

      return isPublished && matchesCategory;
    });
  }
}

/** Instância única e compartilhada do KnowledgeProvider para toda a plataforma. */
export const knowledgeProvider = new KnowledgeProvider();
