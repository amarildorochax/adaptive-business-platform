/**
 * Prompt Version — o histórico de versão de um Prompt Template: "Versionamento é aplicado a todo
 * template, com a mesma disciplina aplicada a código de produção... isso permite, também, reverter um
 * template para uma versão anterior" (`AI_HUB.md`, Capítulo 9, ADR-010). Nenhum precedente legado
 * direto — `src/core/prompt/PromptRecord.ts` incrementa `version` mas nunca preserva o conteúdo de
 * versões anteriores (mesma lacuna já registrada em `PromptSnapshot.ts`, contrato futuro nunca
 * implementado no legado).
 */
export interface PromptVersion {
  readonly promptTemplateId: string;
  readonly version: number;
  readonly content: string;
  readonly recordedAt: Date;
  /** Momento em que esta versão foi substituída, quando aplicável. */
  readonly supersededAt?: Date;
}
