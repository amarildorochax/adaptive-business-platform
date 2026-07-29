// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos 13 Adapters + a base
// `CoreModuleAdapter`/`NotImplementedCoreModuleAdapter`, e a lista
// `allCoreModuleAdapters` consumida por `IntegrationRegistry` para
// registrar todos de uma vez.

import { crmAdapter } from './CrmAdapter';
import { campaignAdapter } from './CampaignAdapter';
import { marketingAdapter } from './MarketingAdapter';
import { financeAdapter } from './FinanceAdapter';
import { analyticsAdapter } from './AnalyticsAdapter';
import { dashboardAdapter } from './DashboardAdapter';
import { automationAdapter } from './AutomationAdapter';
import { workflowAdapter } from './WorkflowAdapter';
import { executionAdapter } from './ExecutionAdapter';
import { knowledgeAdapter } from './KnowledgeAdapter';
import { notificationsAdapter } from './NotificationsAdapter';
import { businessIntelligenceAdapter } from './BusinessIntelligenceAdapter';
import { settingsAdapter } from './SettingsAdapter';
import type { CoreModuleAdapter } from './CoreModuleAdapter';

export * from './CoreModuleAdapter';
export * from './NotImplementedCoreModuleAdapter';
export * from './CrmAdapter';
export * from './CampaignAdapter';
export * from './MarketingAdapter';
export * from './FinanceAdapter';
export * from './AnalyticsAdapter';
export * from './DashboardAdapter';
export * from './AutomationAdapter';
export * from './WorkflowAdapter';
export * from './ExecutionAdapter';
export * from './KnowledgeAdapter';
export * from './NotificationsAdapter';
export * from './BusinessIntelligenceAdapter';
export * from './SettingsAdapter';

export const allCoreModuleAdapters: CoreModuleAdapter[] = [
  crmAdapter,
  campaignAdapter,
  marketingAdapter,
  financeAdapter,
  analyticsAdapter,
  dashboardAdapter,
  automationAdapter,
  workflowAdapter,
  executionAdapter,
  knowledgeAdapter,
  notificationsAdapter,
  businessIntelligenceAdapter,
  settingsAdapter,
];
