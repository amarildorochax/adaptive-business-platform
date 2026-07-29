// CoreModuleAdapter.ts
//
// Responsabilidade:
// Contrato comum implementado por todo Adapter de módulo — a única
// forma pela qual a camada de integração (e, por extensão, qualquer
// Hook/componente React) pode "conversar" com um módulo do Core.
// Nenhum Adapter concreto desta Sprint chama de fato uma fachada do
// Core — todos lançam `ModuleUnavailableError`/retornam status
// `'unknown'`, deixando a implementação real para quando o módulo
// correspondente for efetivamente conectado.

import type { CoreRequest } from '../../contracts/CoreRequest';
import type { CoreResponse } from '../../contracts/CoreResponse';
import type { CoreHealthSnapshot } from '../../contracts/CoreStatus';
import type { CoreModuleId } from '../../types/ModuleId';

export interface CoreModuleAdapter<Dto = unknown, Command = unknown> {
  readonly moduleId: CoreModuleId;
  query(request: CoreRequest): Promise<CoreResponse<Dto>>;
  mutate(command: Command): Promise<CoreResponse<Dto>>;
  health(): Promise<CoreHealthSnapshot>;
}
