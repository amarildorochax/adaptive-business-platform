// PipelineExample.ts
//
// Responsabilidade:
// Demonstração mínima e isolada de que Pipeline.execute() (Sprint B.1)
// realmente percorre as etapas registradas, na ordem certa, e retorna
// PipelineResult.success = true.
//
// RecordingStep NÃO é uma etapa real da plataforma — é apenas uma
// PipelineStep de exemplo, que só existe neste arquivo, usada para
// provar o fluxo:
//
//   Pipeline -> Step A -> Step B -> Step C -> PipelineResult.success = true
//
// Este arquivo não é exportado pelo index.ts do módulo e não é
// importado por nenhum outro ponto do código (nem PlatformRuntime, nem
// BootPipeline) — existe apenas para verificação manual desta Sprint.
// runPipelineExample() é síncrona e não usa console/log/EventBus.

import { Pipeline } from './Pipeline';
import { PipelineStep } from './PipelineStep';
import type { PipelineContext } from './PipelineContext';

class RecordingStep extends PipelineStep {
  constructor(readonly name: string, private readonly order: string[]) {
    super();
  }

  execute(_context: PipelineContext): void {
    this.order.push(this.name);
  }

  rollback(_context: PipelineContext): void {}
}

// Monta Pipeline -> Step A -> Step B -> Step C, executa, e confirma que
// o resultado é bem-sucedido e que as etapas rodaram na ordem em que
// foram registradas. Lança um erro (em vez de usar console) se o
// comportamento esperado não se confirmar.
export function runPipelineExample(): boolean {
  const order: string[] = [];
  const pipeline = new Pipeline();

  pipeline.register(new RecordingStep('step-a', order));
  pipeline.register(new RecordingStep('step-b', order));
  pipeline.register(new RecordingStep('step-c', order));

  const result = pipeline.execute();

  const expectedOrder = ['step-a', 'step-b', 'step-c'];
  const orderMatches =
    order.length === expectedOrder.length &&
    order.every((name, index) => name === expectedOrder[index]);

  if (!result.success || !orderMatches) {
    throw new Error(
      'PipelineExample: comportamento esperado (success = true, ordem step-a/step-b/step-c) não se confirmou'
    );
  }

  return result.success;
}
