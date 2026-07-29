/**
 * Gatilho reutilizável — associa um tipo de evento a condições
 * arbitrárias (Tarefa 05). Referenciado por `AutomationRule.triggerId`.
 *
 * `conditions` é deliberadamente `Record<string, unknown>` — nenhuma
 * gramática de condição é imposta nesta Sprint; `AutomationService.
 * evaluate()` não interpreta o conteúdo de `conditions`, apenas
 * verifica que o AutomationTrigger referenciado existe (ver nota em
 * AutomationService.ts).
 */
export interface AutomationTrigger {
  id: string;

  eventType: string;

  conditions: Record<string, unknown>;

  createdAt: Date;
}
