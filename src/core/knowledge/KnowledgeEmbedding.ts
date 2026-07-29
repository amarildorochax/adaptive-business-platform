/**
 * Contratos de vetores/embeddings/busca semântica futuros (não
 * implementado nesta Sprint; explicitamente proibido implementar
 * embeddings reais ou qualquer vector store nesta Sprint). Mesmo papel
 * que `MemoryEmbedding` (`@/core/memory`) cumpre para MemoryRecord.
 *
 * Responsabilidade reservada: reservar o formato que uma futura busca
 * semântica sobre KnowledgeDocument usará, para que KnowledgeIndex
 * possa vir a expor um `bySemanticQuery()` sem exigir nenhuma mudança
 * estrutural quando chegar a vez. Nenhum componente desta Sprint gera,
 * armazena, ou consulta um KnowledgeEmbeddingVector.
 */
export interface KnowledgeEmbeddingVector {
  documentId: string;
  vector: number[];
  model: string;
  generatedAt: Date;
}

/** Reserva de consulta por similaridade semântica — não implementado. */
export interface KnowledgeSemanticQuery {
  text: string;
  topK: number;
  minScore?: number;
}
