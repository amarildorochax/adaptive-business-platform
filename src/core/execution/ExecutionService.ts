import { automation } from "@/core/automations/Automation";
import type { ExecutionRequest } from "./ExecutionRequest";
import type { ExecutionPlan } from "./ExecutionPlan";
import { ExecutionStore } from "./ExecutionStore";

/**
 * Registra solicitações de execução, controla seus estados e valida
 * pré-condições (Tarefa 03) — **nunca executa nada de fato** (REGRA:
 * "nenhuma execução real nesta Sprint"). Nenhum Workflow, IA,
 * notificação, scheduler ou integração externa é acionado aqui.
 *
 * Consulta exclusivamente `automation.getRule()` — nunca
 * `AutomationManager`/`AutomationService`/`AutomationStore`. A
 * pré-condição validada por `requestExecution()` é simples: o
 * `ruleId` informado precisa corresponder a uma AutomationRule já
 * existente — se não existir, nenhum ExecutionRequest é criado.
 *
 * `requestExecution()` cria o ExecutionRequest e o ExecutionPlan
 * correspondente juntos, atomicamente — não há um método separado para
 * criar apenas o plano.
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * ExecutionManager.
 *
 * Dependências: ExecutionStore (própria instância).
 *
 * Consumido exclusivamente por ExecutionManager.
 */
export class ExecutionService {
  private readonly store = new ExecutionStore();

  /**
   * Registra uma nova solicitação de execução para `ruleId`, já
   * validando que a AutomationRule existe. Cria também o ExecutionPlan
   * correspondente (`steps` = `AutomationRule.actionIds`). Retorna
   * `undefined` se `ruleId` não existir.
   */
  requestExecution(ruleId: string, metadata: Record<string, unknown>): ExecutionRequest | undefined {
    const rule = automation.getRule(ruleId);

    if (!rule) {
      return undefined;
    }

    const request: ExecutionRequest = {
      id: crypto.randomUUID(),
      ruleId,
      requestedAt: new Date(),
      status: "pending",
      metadata,
    };

    this.store.addRequest(request);

    const plan: ExecutionPlan = {
      id: crypto.randomUUID(),
      requestId: request.id,
      steps: rule.actionIds,
      createdAt: new Date(),
      metadata: {},
    };

    this.store.addPlan(plan);

    return request;
  }

  /**
   * Cancela um ExecutionRequest — apenas quando `status` ainda for
   * `"pending"` ou `"approved"`. Retorna `undefined` se não existir, ou
   * se já estiver `"completed"`/`"cancelled"`/`"rejected"`.
   */
  cancelExecution(id: string): ExecutionRequest | undefined {
    const existing = this.store.getRequest(id);

    if (!existing || (existing.status !== "pending" && existing.status !== "approved")) {
      return undefined;
    }

    const updated: ExecutionRequest = { ...existing, status: "cancelled" };
    this.store.addRequest(updated);

    return updated;
  }

  /**
   * Aprova um ExecutionRequest — apenas quando `status` ainda for
   * `"pending"`. Retorna `undefined` se não existir, ou se já não
   * estiver mais pendente.
   */
  approveExecution(id: string): ExecutionRequest | undefined {
    const existing = this.store.getRequest(id);

    if (!existing || existing.status !== "pending") {
      return undefined;
    }

    const updated: ExecutionRequest = { ...existing, status: "approved" };
    this.store.addRequest(updated);

    return updated;
  }

  /** Retorna o ExecutionRequest de `id`, ou `undefined` se não existir. */
  getExecution(id: string): ExecutionRequest | undefined {
    return this.store.getRequest(id);
  }

  /** Retorna todos os ExecutionRequest já registrados. */
  listExecutions(): ExecutionRequest[] {
    return this.store.getAllRequests();
  }
}
