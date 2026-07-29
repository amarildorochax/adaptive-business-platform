// ExecutionAdapter.ts
//
// Responsabilidade:
// Adapter preparado para os módulos de Execution
// (`@/core/execution`/`execution-scheduling`/`execution-engine`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class ExecutionAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'execution';
}

export const executionAdapter = new ExecutionAdapter();
