// CampaignAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Campaign (`@/core/campaign`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class CampaignAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'campaign';
}

export const campaignAdapter = new CampaignAdapter();
