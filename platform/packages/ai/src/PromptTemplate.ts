/**
 * Prompt Template — a unidade fundamental de trabalho do Prompt Engine: "nenhum prompt é escrito
 * diretamente, em texto livre, no momento da solicitação — todo prompt nasce de um template
 * previamente definido, revisado e aprovado, que aceita variáveis específicas de cada solicitação"
 * (`AI_HUB.md`, Capítulo 9). Adaptado de `src/core/prompt/{PromptTemplate.ts, PromptRecord.ts}`
 * (Prompt Manager legado, real e funcional) ao vocabulário do Blueprint — o legado distingue
 * `PromptTemplate` (especialização, sempre System) de `PromptRecord` (forma geral); esta Sprint
 * simplifica para uma única Entidade, já que `AI_HUB.md` nunca cataloga essa distinção formalmente.
 *
 * `content` pode conter placeholders `{{key}}`, substituídos pelo Prompt Composer no momento da
 * composição (mesma disciplina de substituição simples já validada pelo `PromptBuilder` legado).
 */
export interface PromptTemplate {
  readonly promptTemplateId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly content: string;
  /** Versão vigente — incrementada a cada edição, mesma disciplina de `PromptRecord.version` legado. */
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
