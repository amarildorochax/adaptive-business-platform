/**
 * Action — a etapa concreta executada por um Workflow, dez categorias já catalogadas em
 * `AUTOMATION_ENGINE.md`, Capítulo 11. O Action Engine executa a etapa já definida, sem decidir, ele
 * mesmo, se aquela Action deveria ou não ser executada — essa decisão já foi resolvida pelo Condition
 * Engine (Sprint 6.2).
 * `targetDescription` é sempre uma descrição opaca do destino — para "CreateLead"/"UpdateCRM", o
 * Command do CRM Hub invocado; para "SendMessage"/"SendEmail", o Command do Communication Hub; para
 * "GenerateReport"/"UpdateDashboard", o Command do Analytics Hub; para "TriggerIntegration", o
 * Connector do Integration Hub — nenhum desses é importado de `@abp/crm-hub`,
 * `@abp/communication-hub`, `@abp/analytics-hub`, ou `@abp/platform-services`. A categoria
 * "ExecuteAI" é detalhada separadamente em `ActionAIInvocation.ts`, dado seu peso arquitetural
 * específico (`AUTOMATION_ENGINE.md`, Capítulo 12).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 11.
 */
export type ActionCategory =
  | "SendMessage"
  | "SendEmail"
  | "CreateLead"
  | "UpdateCRM"
  | "GenerateReport"
  | "UpdateDashboard"
  | "CreateTask"
  | "ExecuteAI"
  | "TriggerIntegration"
  | "RegisterEvent";

export interface Action {
  /** Identificador da Action. */
  readonly actionId: string;

  /** Categoria da Action. */
  readonly category: ActionCategory;

  /** Descrição opaca do destino específico — nunca um tipo importado de outro pacote. */
  readonly targetDescription: string;

  /** Retry Policy aplicável, quando esta Action está sujeita a falha transitória — ver RetryPolicy.ts. */
  readonly retryPolicyId?: string;

  /** Limite de tempo aceitável para esta etapa concluir, em segundos, antes de ser considerada travada. */
  readonly timeoutSeconds?: number;
}
