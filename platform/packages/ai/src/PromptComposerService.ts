import type { PromptLayer } from './PromptExecution';

export interface ComposePromptInput {
  /** Conteúdo do System Prompt, tipicamente `PromptTemplate.content` — camada de maior prioridade, nunca sobreposta pelas demais (`AI_HUB.md`, Capítulo 9). */
  readonly systemContent?: string;
  /** Resumo já trazido pelo Business Profile Connector — referência opaca, nunca um tipo importado de outro Hub. */
  readonly businessContext?: string;
  /** Resumo já trazido pelo Branding Connector — referência opaca, nunca um tipo importado de outro Hub. */
  readonly brandContext?: string;
  /** A solicitação específica do momento — sempre obrigatória. */
  readonly userPrompt: string;
  /** Valores para substituição simples de `{{key}}`. */
  readonly variables?: Readonly<Record<string, string>>;
}

export interface ComposedPrompt {
  readonly composedPrompt: string;
  readonly layersUsed: readonly PromptLayer[];
}

/**
 * Prompt Composer Service — adaptado de `src/core/prompt/PromptBuilder.ts` (Prompt Manager legado,
 * real e funcional): combina as quatro camadas já Frozen em `AI_HUB.md`, Capítulo 9 — System,
 * Business, Brand, User, sempre nesta ordem de prioridade — e substitui `{{key}}` por `value`
 * (substituição simples, sem escaping, sem valor padrão condicional — mesma disciplina do legado,
 * "substituição avançada" permanece fora do escopo). Uma chave sem valor correspondente permanece
 * literal (`{{chave}}`) no texto final, comportamento idêntico ao legado.
 */
export class PromptComposerService {
  compose(input: ComposePromptInput): ComposedPrompt {
    const layers: Array<{ layer: PromptLayer; content?: string }> = [
      { layer: 'System', content: input.systemContent },
      { layer: 'Business', content: input.businessContext },
      { layer: 'Brand', content: input.brandContext },
      { layer: 'User', content: input.userPrompt },
    ];

    const layersUsed = layers.filter((entry) => Boolean(entry.content)).map((entry) => entry.layer);
    const rawPrompt = layers
      .filter((entry) => Boolean(entry.content))
      .map((entry) => entry.content)
      .join('\n\n');

    const composedPrompt = this.substituteVariables(rawPrompt, input.variables);

    return { composedPrompt, layersUsed };
  }

  private substituteVariables(text: string, variables?: Readonly<Record<string, string>>): string {
    if (!variables) {
      return text;
    }

    return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => variables[key] ?? match);
  }
}
