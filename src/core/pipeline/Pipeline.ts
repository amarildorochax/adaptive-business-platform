import type { PipelineStep } from './PipelineStep';
import { PipelineContext } from './PipelineContext';
import { PipelineResult } from './PipelineResult';

/**
 * Infraestrutura genérica e reutilizável de pipeline: gerencia uma
 * coleção de PipelineStep e as executa, em ordem, quando `execute()` é
 * chamado.
 *
 * Responsabilidade: ser a base compartilhada por qualquer pipeline
 * especializado da plataforma — BootPipeline (src/core/platform/) é a
 * única especialização concreta hoje; pipelines futuros (Lifecycle,
 * Shutdown, Update, Migration, Plugin, Install) devem estender esta
 * classe em vez de reimplementar register/list/clear/execute.
 *
 * Execução inteiramente síncrona: sem async/Promise, sem console/log,
 * sem acesso ao EventBus.
 *
 * Dependências: PipelineStep (tipo), PipelineContext, PipelineResult.
 *
 * Exemplo de uso:
 * ```ts
 * const pipeline = new Pipeline();
 * pipeline.register(new MyStep());
 * const result = pipeline.execute();
 * // result.success, result.errors, result.duration
 * ```
 */
export class Pipeline {
  private readonly steps: PipelineStep[] = [];

  /** Adiciona uma etapa ao final da lista de execução. */
  register(step: PipelineStep): void {
    this.steps.push(step);
  }

  /**
   * Executa todas as etapas registradas, na ordem em que foram
   * registradas, sobre um PipelineContext novo e compartilhado entre
   * elas.
   *
   * Se qualquer etapa lançar uma exceção, a execução para imediatamente
   * (nenhuma etapa seguinte roda); `result.success` fica `false` e a
   * mensagem de erro (`"<nome-da-etapa>: <mensagem>"`) vai para
   * `result.errors`. `rollback()` não é chamado nesta versão.
   *
   * @returns um PipelineResult com `success`, `errors`, e `duration`
   * sempre preenchidos, em qualquer um dos dois casos.
   */
  execute(): PipelineResult {
    const context = new PipelineContext();
    const result = new PipelineResult();
    const startedAt = Date.now();

    let currentStep: PipelineStep | undefined;

    try {
      for (const step of this.steps) {
        currentStep = step;
        step.execute(context);
      }

      result.success = true;
    } catch (error) {
      result.success = false;

      const message = error instanceof Error ? error.message : String(error);

      result.errors.push(
        currentStep ? `${currentStep.name}: ${message}` : message
      );
    }

    result.duration = Date.now() - startedAt;

    return result;
  }

  /** Remove todas as etapas registradas. */
  clear(): void {
    this.steps.length = 0;
  }

  /** Retorna uma cópia rasa da lista de etapas, na ordem de registro. */
  list(): PipelineStep[] {
    return [...this.steps];
  }
}
