import { promptManager, type PromptRequest } from "@/core/prompt/PromptManager";
import type { AIResponse } from "@/core/ai";
import type { ExecutionStep } from "./ExecutionStep";

/** Opções adicionais aceitas por `PromptExecutionProvider.renderStepPrompt()`, repassadas a `PromptManager.generate()`. */
export interface PromptExecutionOptions {
  templateId?: string;
  variables?: Record<string, string>;
}

/**
 * Ponte entre Prompt Manager e Agent Orchestrator (Etapa 24A —
 * Correção 02) — fecha o elo "Prompt Manager → Agent Orchestrator"
 * identificado como ausente pela Architecture Review (Etapa 24, V5).
 *
 * Consome exclusivamente `promptManager.generate()` (API pública já
 * existente, inalterada) — nunca `PromptRegistry`/`PromptBuilder`/
 * `ContextBuilder` diretamente.
 *
 * **Não altera o comportamento de `AgentOrchestrator.execute()`**: este
 * arquivo é inteiramente aditivo — `execute()` continua despachando
 * cada `ExecutionStep` via `AgentDispatcher.dispatch()`, exatamente como
 * antes desta Correção. `renderStepPrompt()` é uma capacidade adicional
 * e independente, disponível para quem quiser renderizar um prompt
 * genérico a partir dos dados já presentes em um `ExecutionStep`
 * (`agentId`/`action`) — nenhum consumidor existente é obrigado a
 * chamá-la, e nenhuma chamada existente foi modificada.
 *
 * Não duplica a responsabilidade já exercida por executores específicos
 * (ex.: `BlogAgentExecutor`, que monta seu próprio prompt via
 * `promptManager` para o Agent "blog"): este Provider é genérico, no
 * nível do próprio Orchestrator, independente de qual Agent executa a
 * etapa — os dois caminhos são complementares, não concorrentes.
 */
export class PromptExecutionProvider {
  /** Renderiza um prompt genérico para `step`, usando `step.action` como instrução e `step.agentId` como metadado de rastreabilidade. */
  async renderStepPrompt(step: ExecutionStep, options: PromptExecutionOptions = {}): Promise<AIResponse> {
    const request: PromptRequest = {
      templateId: options.templateId,
      userPrompt: step.action,
      variables: options.variables,
      metadata: { agentId: step.agentId, stepId: step.id },
    };

    return promptManager.generate(request);
  }
}

/** Instância única e compartilhada do PromptExecutionProvider para todo o Agent Orchestrator. */
export const promptExecutionProvider = new PromptExecutionProvider();
