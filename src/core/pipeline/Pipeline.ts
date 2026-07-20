// Pipeline.ts
//
// Responsabilidade:
// Infraestrutura genérica e reutilizável de pipeline. Gerencia uma
// coleção de PipelineStep e é responsável por executá-las, em ordem,
// quando execute() é chamado.
//
// Esta classe é a fundação compartilhada por qualquer pipeline
// especializado da plataforma — BootPipeline (src/core/platform/) é a
// primeira especialização, e pipelines futuros (LifecyclePipeline,
// ShutdownPipeline, UpdatePipeline, MigrationPipeline, PluginPipeline,
// InstallPipeline, etc.) reutilizam esta mesma classe em vez de
// reimplementar register/list/clear/execute.
//
// register()/list()/clear() fazem gerenciamento real da lista interna
// de etapas (organização de dados, não regra de negócio).
//
// execute() agora roda de verdade (Sprint B.1):
//   1. cria um PipelineContext novo, compartilhado por todas as etapas;
//   2. marca o horário inicial;
//   3. percorre as etapas na ordem em que foram registradas, chamando
//      step.execute(context);
//   4. se todas rodarem sem lançar exceção, success = true;
//   5. se qualquer etapa lançar, a execução para imediatamente
//      (nenhuma etapa seguinte roda), success = false e a mensagem vai
//      para result.errors — sem chamar rollback, que fica para uma
//      Sprint futura;
//   6. duration é sempre calculada, em qualquer um dos dois casos.
//
// Execução inteiramente síncrona: sem async/Promise, sem console/log,
// sem acesso ao EventBus. Nenhuma integração com PlatformRuntime ou
// BootPipeline é feita aqui — quem chama execute() é responsabilidade
// de uma etapa futura.
//
// Não é um Singleton: cada instância de Pipeline tem sua própria lista
// de etapas.

import type { PipelineStep } from './PipelineStep';
import { PipelineContext } from './PipelineContext';
import { PipelineResult } from './PipelineResult';

export class Pipeline {
  private readonly steps: PipelineStep[] = [];

  register(step: PipelineStep): void {
    this.steps.push(step);
  }

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

  clear(): void {
    this.steps.length = 0;
  }

  list(): PipelineStep[] {
    return [...this.steps];
  }
}
