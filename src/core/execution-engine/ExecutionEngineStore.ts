import type { ExecutionRun } from "./ExecutionRun";
import type { ExecutionStep } from "./ExecutionStep";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Armazenamento de ExecutionRun/ExecutionStep/ExecutionResult —
 * exclusivamente em memória (`Map`), sem persistência. Único Store
 * desta Sprint.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio/validação (isso é responsabilidade de
 * ExecutionEngineService) e nenhuma emissão de evento (isso é
 * responsabilidade de ExecutionEngineManager).
 *
 * Consumido exclusivamente por ExecutionEngineService.
 */
export class ExecutionEngineStore {
  private runs = new Map<string, ExecutionRun>();

  private steps = new Map<string, ExecutionStep>();

  private results = new Map<string, ExecutionResult>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um ExecutionRun. */
  addRun(run: ExecutionRun): void {
    this.runs.set(run.id, run);
  }

  /** Retorna o ExecutionRun de `id`, ou `undefined` se não existir. */
  getRun(id: string): ExecutionRun | undefined {
    return this.runs.get(id);
  }

  /** Retorna todos os ExecutionRun já registrados. */
  getAllRuns(): ExecutionRun[] {
    return Array.from(this.runs.values());
  }

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um ExecutionStep. */
  addStep(step: ExecutionStep): void {
    this.steps.set(step.id, step);
  }

  /** Retorna os ExecutionStep de `runId`. */
  getStepsByRun(runId: string): ExecutionStep[] {
    return Array.from(this.steps.values()).filter((step) => step.runId === runId);
  }

  /** Adiciona um novo ExecutionResult. */
  addResult(result: ExecutionResult): void {
    this.results.set(result.id, result);
  }

  /** Retorna o ExecutionResult de `runId`, ou `undefined` se não existir. */
  getResultByRun(runId: string): ExecutionResult | undefined {
    return Array.from(this.results.values()).find((result) => result.runId === runId);
  }

  /** Remove todos os dados armazenados (as três entidades). */
  clear(): void {
    this.runs.clear();
    this.steps.clear();
    this.results.clear();
  }
}
