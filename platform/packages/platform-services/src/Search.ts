/**
 * Search Query / Search Result — uma consulta de busca, restrita ao Tenant do consulente, e seu
 * resultado ranqueado.
 * Estrutura, regras e invariantes definidas em KNOWLEDGE_CONCRETE_STRUCTURE.md.
 */
export interface SearchQuery {
  /** Tenant ao qual a consulta está restrita — isolamento absoluto, inclusive no índice de busca. */
  readonly tenantId: string;

  /** Texto da consulta. */
  readonly text: string;
}

export interface SearchResult {
  /** Ativo retornado pela consulta. */
  readonly assetId: string;

  /** Posição no ranking de relevância. */
  readonly rank: number;
}
