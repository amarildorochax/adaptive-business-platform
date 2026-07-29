// CrmAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo CRM (`@/core/crm`, fachada `crm`).
// Nenhuma chamada real ao Core ainda — ver `NotImplementedCoreModuleAdapter`.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class CrmAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'crm';
}

export const crmAdapter = new CrmAdapter();
