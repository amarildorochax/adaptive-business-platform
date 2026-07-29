// AutomationAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Automation (`@/core/automations`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class AutomationAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'automation';
}

export const automationAdapter = new AutomationAdapter();
