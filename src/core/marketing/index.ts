// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo marketing — o Marketing
// Intelligence completo (Marketing, MarketingManager, CampaignAnalyzer,
// CustomerSegmentation, AudienceAnalyzer, MarketingInsights,
// MarketingMetrics, CampaignProvider, e os contratos futuros
// MarketingAutomation/EmailProvider/WhatsAppProvider/
// SocialMediaProvider).
//
// Nota (Sprint 10B): MarketingSimulatedData.ts foi removido — o CRM
// Core (`@/core/crm`), via CampaignProvider, é agora a única fonte de
// dados.
//
// Consumidores fora deste módulo devem preferir `marketing` (fachada) —
// nunca MarketingManager/os Analyzers/CampaignProvider diretamente.

export * from './Marketing';
export * from './MarketingManager';
export * from './CampaignAnalyzer';
export * from './CustomerSegmentation';
export * from './AudienceAnalyzer';
export * from './MarketingInsights';
export * from './MarketingMetrics';
export * from './CampaignProvider';
export * from './MarketingAutomation';
export * from './EmailProvider';
export * from './WhatsAppProvider';
export * from './SocialMediaProvider';
