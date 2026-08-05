import type { IndexEntryRepository } from "./IndexEntryRepository.js";
import type { KnowledgeAssetRepository } from "./KnowledgeAssetRepository.js";
import type { SearchQuery, SearchResult } from "./Search.js";

/**
 * Knowledge Search Service — implementa, no Core desta Sprint, o "Search Engine" restrito à Keyword
 * Search sobre metadado estruturado (`category`/`tags` de `KnowledgeAsset` — nenhum campo de conteúdo
 * é modelado nesta Sprint, ver "Decisões Arquiteturais"). **Nunca** implementa Semantic Search nem
 * Hybrid Search — ambas dependem do Embedding Manager, explicitamente fora de escopo (RAG/Embeddings/
 * Vector Search). Apenas ativos já indexados (`IndexEntry` existente) são candidatos a resultado —
 * mesmo princípio "toda consulta deve passar pelo índice" já evidenciado no legado
 * (`KnowledgeSearch`/`KnowledgeIndex`, `src/core/knowledge/`). Consulta sempre restrita ao
 * `tenantId` do `SearchQuery` (ADR-011: "isolamento absoluto, inclusive no índice de busca").
 */
export class KnowledgeSearchService {
  constructor(
    private readonly assets: KnowledgeAssetRepository,
    private readonly index: IndexEntryRepository,
  ) {}

  async search(query: SearchQuery): Promise<readonly SearchResult[]> {
    const candidates = await this.assets.listByTenant(query.tenantId);
    const normalized = query.text.trim().toLowerCase();

    const ranked: SearchResult[] = [];
    for (const asset of candidates) {
      const indexed = await this.index.findByAssetId(asset.assetId);
      if (!indexed) {
        continue;
      }

      const matches = [asset.category, ...asset.tags].filter(
        (field): field is string => field != null && field.toLowerCase().includes(normalized),
      ).length;

      if (matches > 0) {
        ranked.push({ assetId: asset.assetId, rank: matches });
      }
    }

    return ranked.sort((a, b) => b.rank - a.rank);
  }
}
