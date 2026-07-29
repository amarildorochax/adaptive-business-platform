import type { ExecutionSchedule } from "./ExecutionSchedule";
import type { ApprovalRecord } from "./ApprovalRecord";

/**
 * Armazenamento de ExecutionSchedule/ApprovalRecord — exclusivamente
 * em memória (`Map`), sem persistência. Único Store desta Sprint.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio/validação (isso é responsabilidade de
 * ExecutionSchedulingService) e nenhuma emissão de evento (isso é
 * responsabilidade de ExecutionSchedulingManager).
 *
 * Consumido exclusivamente por ExecutionSchedulingService.
 */
export class ExecutionSchedulingStore {
  private schedules = new Map<string, ExecutionSchedule>();

  private approvals = new Map<string, ApprovalRecord>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um ExecutionSchedule. */
  addSchedule(schedule: ExecutionSchedule): void {
    this.schedules.set(schedule.id, schedule);
  }

  /** Retorna o ExecutionSchedule de `id`, ou `undefined` se não existir. */
  getSchedule(id: string): ExecutionSchedule | undefined {
    return this.schedules.get(id);
  }

  /** Retorna todos os ExecutionSchedule já registrados. */
  getAllSchedules(): ExecutionSchedule[] {
    return Array.from(this.schedules.values());
  }

  /** Adiciona um novo ApprovalRecord. */
  addApproval(approval: ApprovalRecord): void {
    this.approvals.set(approval.id, approval);
  }

  /** Retorna todos os ApprovalRecord já registrados. */
  getAllApprovals(): ApprovalRecord[] {
    return Array.from(this.approvals.values());
  }

  /** Remove todos os dados armazenados (as duas entidades). */
  clear(): void {
    this.schedules.clear();
    this.approvals.clear();
  }
}
