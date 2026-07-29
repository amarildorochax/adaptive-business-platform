// MarketingAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Marketing (`@/core/marketing`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class MarketingAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'marketing';
}

export const marketingAdapter = new MarketingAdapter();
