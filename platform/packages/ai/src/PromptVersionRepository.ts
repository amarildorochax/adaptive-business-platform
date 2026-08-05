import type { PromptVersion } from './PromptVersion';

/** Contrato de persistência de Prompt Version — apenas o contrato. `update` existe apenas para marcar `supersededAt` de uma versão anterior, nunca para alterar o conteúdo já registrado de uma versão (ADR-010, prompt versionado com o mesmo rigor de código de produção). */
export interface PromptVersionRepository {
  create(version: PromptVersion): Promise<PromptVersion>;
  update(version: PromptVersion): Promise<PromptVersion>;
  list(promptTemplateId: string): Promise<PromptVersion[]>;
}
