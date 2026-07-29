/**
 * Benchmark — a referência comparativa de desempenho, interna ou de mercado, contra a qual um
 * indicador é avaliado; preserva histórico — uma atualização nunca sobrescreve o valor anterior,
 * sempre produz novo registro versionado (Blueprint, Capítulo 12).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Benchmark {
  /** Identificador do Benchmark. */
  readonly benchmarkId: string;

  /** Tenant ao qual este Benchmark se aplica. */
  readonly tenantId: string;

  /** Número da versão — cada atualização produz uma nova versão. */
  readonly version: number;

  /** Valor de referência nesta versão. */
  readonly value: number;

  /** Momento do registro desta versão. */
  readonly recordedAt: Date;
}
