// PromptVariable.ts
//
// Responsabilidade (Tarefa 10 — Suporte a Variáveis):
// Contrato mínimo de uma variável de template (ex.: {{businessName}},
// {{audience}}, {{language}}, {{tone}}, {{goal}}). `PromptBuilder`
// implementa apenas substituição simples de `{{key}}` por `value` — sem
// escaping, sem valores padrão condicionais, sem variáveis aninhadas ou
// computadas ("substituição avançada", explicitamente fora do escopo
// desta Sprint). Uma chave sem valor correspondente permanece literal
// (`{{chave}}`) no texto final.

/** Nomes de variável já usados pelos templates seed desta Sprint — não é uma lista fechada. */
export type PromptVariableKey =
  | "businessName"
  | "audience"
  | "language"
  | "tone"
  | "goal"
  | (string & {});

/** Uma variável declarada por um PromptTemplate/PromptRecord. */
export interface PromptVariable {
  key: PromptVariableKey;
  description?: string;
  required?: boolean;
}
