import type { KnowledgeDocument } from "./KnowledgeDocument";

/**
 * Contrato de snapshot/histórico de versões futuro (não implementado
 * nesta Sprint). Mesmo papel que `MemorySnapshot`/`PromptSnapshot`
 * cumprem para seus respectivos registros.
 *
 * `KnowledgeManager` hoje apenas incrementa `KnowledgeDocument.version`
 * — nenhum componente desta Sprint cria, armazena, ou consulta um
 * KnowledgeSnapshot.
 */
export interface KnowledgeSnapshot {
  documentId: string;
  version: number;
  document: KnowledgeDocument;
  snapshotAt: Date;
}
