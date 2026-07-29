/**
 * Regra de automação — entidade central do Automation Center (Tarefa
 * 04): liga um AutomationTrigger a uma ou mais AutomationAction.
 * `enabled` inicia sempre em `false` na criação — precisa de
 * `enableRule()` explícito antes de `executeRule()` produzir algum
 * efeito (ver AutomationService.ts).
 */
export interface AutomationRule {
  id: string;

  name: string;

  description: string;

  enabled: boolean;

  triggerId: string;

  actionIds: string[];

  priority: number;

  createdAt: Date;

  updatedAt: Date;

  metadata: Record<string, unknown>;
}
