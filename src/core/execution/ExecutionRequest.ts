import type { ExecutionStatus } from "./ExecutionStatus";

/**
 * Uma solicitação de execução de uma AutomationRule (Tarefa 04) —
 * apenas registra a intenção; nunca executa nada de fato (ver nota em
 * ExecutionService.ts). `ruleId` é validado contra `automation.
 * getRule()` no momento da criação — uma ExecutionRequest nunca existe
 * para um `ruleId` inexistente.
 */
export interface ExecutionRequest {
  id: string;

  ruleId: string;

  requestedAt: Date;

  status: ExecutionStatus;

  metadata: Record<string, unknown>;
}
