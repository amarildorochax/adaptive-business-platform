/**
 * Ação reutilizável — descreve o que aconteceria caso disparada, nunca
 * o que de fato acontece (Tarefa 06). Referenciada por
 * `AutomationRule.actionIds`.
 *
 * `type`/`target`/`parameters` são apenas dados descritivos — nenhum
 * código nesta Sprint interpreta `type` para decidir qual efeito
 * colateral real produzir (ver `AutomationExecutor`, contrato futuro,
 * Tarefa 12).
 */
export interface AutomationAction {
  id: string;

  type: string;

  target: string;

  parameters: Record<string, unknown>;

  createdAt: Date;
}
