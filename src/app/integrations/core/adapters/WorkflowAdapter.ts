// WorkflowAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Workflow (`@/core/workflow`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class WorkflowAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'workflow';
}

export const workflowAdapter = new WorkflowAdapter();
