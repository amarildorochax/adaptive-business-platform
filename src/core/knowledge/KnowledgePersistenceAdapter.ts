import type { KnowledgeDocument } from "./KnowledgeDocument";

/**
 * Contrato de persistência futura para KnowledgeStore (não implementado
 * nesta Sprint). Mesmo papel que `MemoryPersistenceAdapter`
 * (`@/core/memory`) cumpre para MemoryStore.
 *
 * Responsabilidade reservada: quando um backend de persistência real
 * for autorizado em uma Sprint futura, ele deve implementar esta
 * interface — `KnowledgeStore` então passaria a delegar a ela em vez de
 * manter apenas o `Map` em memória. Nenhum componente desta Sprint
 * instancia, consome, ou depende deste contrato.
 */
export interface KnowledgePersistenceAdapter {
  save(document: KnowledgeDocument): Promise<void>;
  load(id: string): Promise<KnowledgeDocument | undefined>;
  loadAll(): Promise<KnowledgeDocument[]>;
  delete(id: string): Promise<void>;
}
