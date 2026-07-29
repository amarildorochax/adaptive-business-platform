/**
 * Dispatch Target — o destino ao qual o Dispatcher encaminha uma solicitação já contextualizada,
 * sem decidir, ele mesmo, qual Workflow, qual Regra, ou qual resposta é apropriada — essa decisão
 * permanece inteiramente do componente de destino (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seções 4 e
 * 7).
 * `targetDescription` é sempre opaco — para "AutomationEngine", nenhum tipo de
 * `@abp/automation-engine` além de identificador é referenciado; para "BusinessHub", nenhum tipo de
 * `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, ou
 * `@abp/growth-hub`; para "AIHub", nenhum tipo de `@abp/ai`.
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4.
 */
export type DispatchTargetKind = "AutomationEngine" | "BusinessHub" | "AIHub";

export interface DispatchTarget {
  /** Identificador do Dispatch Target. */
  readonly dispatchTargetId: string;

  /** Categoria do destino. */
  readonly kind: DispatchTargetKind;

  /** Descrição opaca do destino específico — nunca um tipo importado de outro pacote. */
  readonly targetDescription: string;
}
