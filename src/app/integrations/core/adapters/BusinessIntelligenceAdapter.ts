// BusinessIntelligenceAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Business Intelligence
// (`@/core/business-intelligence`). Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class BusinessIntelligenceAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'business-intelligence';
}

export const businessIntelligenceAdapter = new BusinessIntelligenceAdapter();
