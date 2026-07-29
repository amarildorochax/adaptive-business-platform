/**
 * Generic Query — forma estrutural genérica de leitura sem efeito colateral.
 * Estrutura, regras e invariantes definidas em SHARED_TYPES_CONCRETE_STRUCTURE.md.
 */
export interface Query<TFilters = unknown> {
  /** Identificador nomeado do modelo de leitura solicitado (ex.: "CustomerView"). */
  readonly name: string;

  /** Parâmetros de busca/seleção, específicos por Query — opaco à forma genérica. */
  readonly filters: TFilters;

  /** Critério de ordenação do resultado, quando aplicável, específico por Query. */
  readonly sorting?: unknown;

  /** Corte explícito de volume de resultado, obrigatório quando o resultado não é intrinsecamente limitado. */
  readonly pagination?: unknown;

  /** Versão explícita do contrato desta Query. */
  readonly contractVersion: string;
}
