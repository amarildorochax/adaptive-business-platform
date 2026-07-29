import type { PromptRecord } from "./PromptRecord";

/**
 * Domínios de template reutilizável já previstos (Tarefa 03).
 * `GENERAL` é o template de propósito genérico, usado quando nenhum
 * `kind` mais específico se aplica.
 */
export enum PromptTemplateKind {
  BLOG = "blog",
  CRM = "crm",
  MARKETING = "marketing",
  SUPPORT = "atendimento",
  FINANCE = "financeiro",
  SEO = "seo",
  GENERAL = "geral",
}

/**
 * Um PromptRecord especializado para representar um template
 * reutilizável de System Prompt para um domínio específico (Blog, CRM,
 * Marketing, Atendimento, Financeiro, SEO, Geral).
 *
 * Sempre `type: PromptType.SYSTEM` (ver PromptType.ts) — um
 * PromptTemplate nunca representa um User Prompt.
 *
 * Registrado e gerido por PromptRegistry, exatamente como qualquer
 * outro PromptRecord — `PromptTemplate` é uma especialização de
 * tipagem, nunca um armazenamento à parte.
 */
export interface PromptTemplate extends PromptRecord {
  kind: PromptTemplateKind;
}
