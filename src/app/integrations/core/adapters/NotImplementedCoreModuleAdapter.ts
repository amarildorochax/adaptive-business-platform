// NotImplementedCoreModuleAdapter.ts
//
// Responsabilidade:
// Implementação-base compartilhada pelos 13 Adapters — desde a
// Sprint 31A, `query`/`mutate` passam pelo Integration Pipeline
// (`PipelineRegistry.resolve(moduleId)` → `IntegrationPipeline.run()` →
// os 13 Middlewares → este `finalHandler`), em vez de lançar o erro
// diretamente. O comportamento observável é idêntico ao da Sprint 30:
// ambos os métodos continuam lançando `ModuleUnavailableError` com a
// mesma mensagem — o Pipeline apenas envolve essa chamada, sem alterar
// seu resultado. `health()` não passa pelo Pipeline (não é uma operação
// de request/response — ver Relatório da Sprint 31A).
//
// Uma Sprint futura que conectar um módulo real substitui apenas o
// `finalHandler` (a função passada a `pipeline.run()`) por uma chamada
// de verdade à fachada pública do Core correspondente — nenhum
// Middleware, nem `CoreModuleAdapter`, nem nenhum Hook/componente
// precisa mudar.

import type { CoreModuleAdapter } from './CoreModuleAdapter';
import type { CoreRequest } from '../../contracts/CoreRequest';
import type { CoreResponse } from '../../contracts/CoreResponse';
import type { CoreHealthSnapshot } from '../../contracts/CoreStatus';
import type { CoreModuleId } from '../../types/ModuleId';
import type { PipelineRequest } from '../../pipeline/PipelineRequest';
import { pipelineRegistry } from '../../registry/PipelineRegistry';
import { ModuleUnavailableError } from '../../errors/ModuleUnavailableError';

export abstract class NotImplementedCoreModuleAdapter<Dto = unknown, Command = unknown>
  implements CoreModuleAdapter<Dto, Command>
{
  abstract readonly moduleId: CoreModuleId;

  private notImplementedHandler(): never {
    throw new ModuleUnavailableError(
      `Adapter do módulo "${this.moduleId}" ainda não está conectado ao Core.`,
      this.moduleId,
    );
  }

  async query(request: CoreRequest): Promise<CoreResponse<Dto>> {
    const pipelineRequest: PipelineRequest<CoreRequest> = {
      moduleId: this.moduleId,
      operation: 'query',
      payload: request,
    };

    const response = await pipelineRegistry
      .resolve(this.moduleId)
      .run<Dto, CoreRequest>(pipelineRequest, async () => this.notImplementedHandler());

    return { data: response.data, metadata: response.metadata };
  }

  async mutate(command: Command): Promise<CoreResponse<Dto>> {
    const pipelineRequest: PipelineRequest<Command> = {
      moduleId: this.moduleId,
      operation: 'mutate',
      payload: command,
    };

    const response = await pipelineRegistry
      .resolve(this.moduleId)
      .run<Dto, Command>(pipelineRequest, async () => this.notImplementedHandler());

    return { data: response.data, metadata: response.metadata };
  }

  async health(): Promise<CoreHealthSnapshot> {
    return { moduleId: this.moduleId, status: 'unknown', checkedAt: new Date().toISOString() };
  }
}
