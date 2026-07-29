// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo campaign — o Campaign Management
// completo (Campaign, CampaignManager, CampaignService, CampaignStore,
// CampaignRecord, CampaignStatus, CampaignAudience, CampaignExecution,
// CampaignResult, CampaignMetrics, e os contratos futuros
// CampaignExecutionProvider/CampaignChannelProvider/CampaignScheduler/
// CampaignAutomationProvider/CampaignAnalyticsProvider).
//
// Consumidores fora deste módulo devem preferir `campaign` (fachada) —
// nunca CampaignManager/CampaignService/CampaignStore diretamente.

export * from './Campaign';
export * from './CampaignManager';
export * from './CampaignService';
export * from './CampaignStore';
export * from './CampaignRecord';
export * from './CampaignStatus';
export * from './CampaignAudience';
export * from './CampaignExecution';
export * from './CampaignResult';
export * from './CampaignMetrics';
export * from './CampaignExecutionProvider';
export * from './CampaignChannelProvider';
export * from './CampaignScheduler';
export * from './CampaignAutomationProvider';
export * from './CampaignAnalyticsProvider';
