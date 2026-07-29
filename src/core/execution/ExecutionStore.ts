import type { ExecutionRequest } from "./ExecutionRequest";
import type { ExecutionPlan } from "./ExecutionPlan";

/**
 * Armazenamento de ExecutionRequest/ExecutionPlan — exclusivamente em
 * memória (`Map`), sem persistência. Único Store desta Sprint.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio/validação (isso é responsabilidade de
 * ExecutionService) e nenhuma emissão de evento (isso é
 * responsabilidade de ExecutionManager).
 *
 * Consumido exclusivamente por ExecutionService.
 */
export class ExecutionStore {
  private requests = new Map<string, ExecutionRequest>();

  private plans = new Map<string, ExecutionPlan>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um ExecutionRequest. */
  addRequest(request: ExecutionRequest): void {
    this.requests.set(request.id, request);
  }

  /** Retorna o ExecutionRequest de `id`, ou `undefined` se não existir. */
  getRequest(id: string): ExecutionRequest | undefined {
    return this.requests.get(id);
  }

  /** Retorna todos os ExecutionRequest já registrados. */
  getAllRequests(): ExecutionRequest[] {
    return Array.from(this.requests.values());
  }

  /** Adiciona um novo ExecutionPlan. */
  addPlan(plan: ExecutionPlan): void {
    this.plans.set(plan.id, plan);
  }

  /** Retorna o ExecutionPlan de `requestId`, ou `undefined` se não existir. */
  getPlanByRequestId(requestId: string): ExecutionPlan | undefined {
    return Array.from(this.plans.values()).find((plan) => plan.requestId === requestId);
  }

  /** Remove todos os dados armazenados (as duas entidades). */
  clear(): void {
    this.requests.clear();
    this.plans.clear();
  }
}
