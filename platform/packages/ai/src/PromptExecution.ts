/**
 * Prompt Execution — o registro de uma composição de prompt já concluída pelo Prompt Composer, a
 * partir das quatro camadas já Frozen em `AI_HUB.md`, Capítulo 9: System Prompt, Business Prompt,
 * Brand Prompt e User Prompt. `layersUsed` registra quais camadas efetivamente contribuíram para o
 * prompt final — o System Prompt é sempre incluído (comportamento fundamental inegociável da IA da
 * plataforma), as demais são condicionais à disponibilidade de Business Profile/Branding/Template
 * para aquela solicitação.
 *
 * Nenhum precedente legado direto — `src/core/prompt/PromptManager.ts` compõe um prompt (via
 * `PromptBuilder`) mas nunca preserva um registro auditável de cada composição individual.
 */
export type PromptLayer = 'System' | 'Business' | 'Brand' | 'User';

export interface PromptExecution {
  readonly promptExecutionId: string;
  readonly tenantId: string;
  readonly promptTemplateId?: string;
  readonly composedPrompt: string;
  readonly layersUsed: readonly PromptLayer[];
  readonly composedAt: Date;
}
