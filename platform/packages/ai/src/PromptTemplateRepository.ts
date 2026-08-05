import type { PromptTemplate } from './PromptTemplate';

/** Contrato de persistência de Prompt Template — apenas o contrato. */
export interface PromptTemplateRepository {
  create(template: PromptTemplate): Promise<PromptTemplate>;
  update(template: PromptTemplate): Promise<PromptTemplate>;
  get(promptTemplateId: string): Promise<PromptTemplate | undefined>;
  list(tenantId: string): Promise<PromptTemplate[]>;
}
