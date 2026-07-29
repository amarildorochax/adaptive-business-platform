/**
 * Action AI Invocation — o registro declarativo de que a Action de categoria "ExecuteAI" invocou o
 * AI Hub, exclusivamente através do contrato externo já publicado — nunca através de nenhum dos
 * onze componentes internos do AI Core (`PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`,
 * Seção 7). O Automation Engine "não incorpora nenhuma lógica inteligente própria... trata o
 * resultado retornado como um valor estruturado, consumido pela etapa seguinte do Workflow através
 * de Conditions e Actions já configuradas, nunca reinterpretado por uma lógica adicional dentro do
 * próprio Automation Engine" (`AUTOMATION_ENGINE.md`, Capítulo 12).
 * Este é o artefato de maior sensibilidade arquitetural desta Sprint, conforme já registrado em
 * `PHASE_6_IMPLEMENTATION_BACKLOG.md`, item AUTO-03, Riscos.
 * Nenhum tipo de `@abp/ai` é importado por este arquivo — toda referência é opaca.
 */
export interface ActionAIInvocation {
  /** Action de categoria "ExecuteAI" à qual esta invocação se refere. */
  readonly actionId: string;

  /** Descrição opaca da finalidade da solicitação ao AI Hub. */
  readonly purposeDescription: string;

  /** Resultado retornado pelo AI Hub, tratado como dado estruturado de entrada para a etapa seguinte — nunca reinterpretado. */
  readonly resultDescription: string;

  /** Momento da invocação. */
  readonly invokedAt: Date;
}
