/**
 * Contratos de vetores/embeddings/RAG futuros (Tarefa 11 — não
 * implementado nesta Sprint; explicitamente proibido implementar
 * embeddings reais ou qualquer vector store nesta Sprint).
 *
 * Responsabilidade: reservar o formato que uma futura busca semântica
 * sobre MemoryRecord usará, para que MemoryIndex possa vir a expor um
 * `bySemanticQuery()` sem exigir nenhuma mudança estrutural quando
 * chegar a vez. Nenhum componente desta Sprint gera, armazena, ou
 * consulta um MemoryEmbeddingVector.
 */
export interface MemoryEmbeddingVector {
  recordId: string;
  vector: number[];
  model: string;
  generatedAt: Date;
}

/** Reserva de consulta por similaridade semântica — não implementado. */
export interface MemorySemanticQuery {
  text: string;
  topK: number;
  minScore?: number;
}
