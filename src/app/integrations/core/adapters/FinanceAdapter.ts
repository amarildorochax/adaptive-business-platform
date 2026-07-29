// FinanceAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Finance (`@/core/finance`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class FinanceAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'finance';
}

export const financeAdapter = new FinanceAdapter();
