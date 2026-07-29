// AnalyticsAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Analytics (`@/core/analytics`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class AnalyticsAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'analytics';
}

export const analyticsAdapter = new AnalyticsAdapter();
