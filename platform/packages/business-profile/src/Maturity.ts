/**
 * Maturity — "Maturidade Digital... o estágio de sofisticação da operação digital de uma Empresa,
 * mantido pelo Business Maturity Engine, independente do Segmento" (`BUSINESS_PROFILE_ENGINE.md`,
 * Capítulo 8; Ownership: `DOMAIN_OWNERSHIP_MATRIX.md`, "Maturity").
 *
 * Deliberadamente `string`, nunca uma união fechada — o Blueprint nunca enumera um conjunto fechado
 * de estágios de maturidade (apenas exemplos qualitativos em prosa nos Casos de Uso do Capítulo 20:
 * "maturidade inicial baixa", "maturidade elevada") — mesma disciplina de "nunca inventar um enum
 * ausente do Blueprint" já aplicada a `Incident.severity` (IMP-012).
 */
export type Maturity = string;
