import type { PromptTemplate } from "./PromptTemplate";

/** Entrada aceita por `PromptBuilder.build()` — já resolvida pelo PromptManager (template, se algum, já localizado). */
export interface PromptBuildInput {
  /** System Prompt já resolvido (do PromptTemplate, quando informado) ou fornecido diretamente. */
  systemPrompt?: string;

  /** User Prompt — a instrução real da tarefa. Sempre obrigatório. */
  userPrompt: string;

  /** Ferramentas disponíveis ao Agent nesta chamada — apenas descritivo, nenhuma invocação real de tool-calling. */
  tools?: string[];

  /** Valores para substituição simples de `{{key}}` em `systemPrompt`/`userPrompt`. */
  variables?: Record<string, string>;

  /** Repassado integralmente ao resultado — inclui, tipicamente, `category`/`tags` para o ContextBuilder. */
  metadata?: Record<string, unknown>;
}

/** Resultado de `PromptBuilder.build()` — pronto para `PromptManager` encaminhar ao ContextBuilder. */
export interface ComposedPrompt {
  /** Texto final, já com variáveis substituídas — System + User + Tools, nas seções já rotuladas. */
  prompt: string;

  metadata: Record<string, unknown>;
}

function substituteVariables(text: string, variables?: Record<string, string>): string {
  if (!variables) {
    return text;
  }

  return text.replace(/{{\s*([\w.]+)\s*}}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match;
  });
}

/**
 * Monta o texto final de um prompt a partir de System Prompt, User
 * Prompt, Ferramentas, e Metadata (Tarefa 02).
 *
 * Responsabilidade: única lógica de composição textual de prompt da
 * plataforma — nenhum Agent deve concatenar strings de prompt
 * manualmente (ver BlogAgentExecutor.ts).
 *
 * Sobre "Contexto" e "Memória" (também citados na Tarefa 02): este
 * Builder nunca busca conteúdo real de contexto ou de memória — isso
 * permanece exclusivamente responsabilidade de ContextBuilder/
 * BusinessMemory (Business Memory, inalterada nesta Sprint).
 * `PromptBuilder` apenas repassa `metadata` (ex.: `category`/`tags`)
 * para que ContextBuilder saiba o que buscar quando `PromptManager` o
 * chamar em seguida.
 *
 * Substituição de variáveis: simples (`{{key}}` → `variables[key]`,
 * via expressão regular, sem escaping ou lógica condicional) — "sem
 * substituição avançada", conforme a Tarefa 10.
 *
 * Dependências: PromptTemplate (tipo, apenas para documentar a origem
 * esperada de `systemPrompt`).
 */
export class PromptBuilder {
  /** Monta o ComposedPrompt final — ver PromptBuildInput/ComposedPrompt. */
  build(input: PromptBuildInput): ComposedPrompt {
    const systemPrompt = substituteVariables(input.systemPrompt ?? "", input.variables);
    const userPrompt = substituteVariables(input.userPrompt, input.variables);

    const sections: string[] = [];

    if (systemPrompt.trim().length > 0) {
      sections.push(`[System]\n${systemPrompt}`);
    }

    sections.push(`[User]\n${userPrompt}`);

    if (input.tools && input.tools.length > 0) {
      sections.push(`[Tools]\n${input.tools.join(", ")}`);
    }

    return {
      prompt: sections.join("\n\n"),
      metadata: input.metadata ?? {},
    };
  }

  /** Resolve o `content` de um PromptTemplate já localizado como o `systemPrompt` de um futuro `build()`. */
  systemPromptFromTemplate(template: PromptTemplate): string {
    return template.content;
  }
}
