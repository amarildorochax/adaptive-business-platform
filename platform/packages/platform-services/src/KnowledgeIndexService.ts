import type { IndexEntry } from "./IndexEntry.js";
import type { IndexEntryRepository } from "./IndexEntryRepository.js";

/**
 * Knowledge Index Service — implementa o "Index Manager" (`KNOWLEDGE_HUB.md`, Capítulo 7): "mantém o
 * índice de busca atualizado... garantindo que uma nova versão de documento, uma vez publicada, esteja
 * pesquisável." Restrito à indexação estrutural do Index Manager — nunca ao Embedding Manager
 * (representação vetorial/semântica), explicitamente fora de escopo desta Sprint (RAG/Embeddings/
 * Vector Search).
 */
export class KnowledgeIndexService {
  constructor(private readonly repository: IndexEntryRepository) {}

  async index(assetId: string): Promise<IndexEntry> {
    const entry: IndexEntry = { assetId, indexedAt: new Date() };
    return this.repository.create(entry);
  }

  async isIndexed(assetId: string): Promise<boolean> {
    return (await this.repository.findByAssetId(assetId)) !== undefined;
  }
}
