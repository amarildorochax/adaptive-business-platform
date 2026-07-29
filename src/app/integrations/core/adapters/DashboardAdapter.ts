// DashboardAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Dashboard (`@/core/dashboard`).
// Nenhuma chamada real ao Core ainda — não confundir com o Dashboard
// Premium do Frontend (`@/app/features/dashboard`, Sprint 28), que
// continua 100% mock e não consome este Adapter nesta Sprint.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class DashboardAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'dashboard';
}

export const dashboardAdapter = new DashboardAdapter();
