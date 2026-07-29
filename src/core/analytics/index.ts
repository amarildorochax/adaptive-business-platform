// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo analytics — o Business Analytics
// completo (Analytics, AnalyticsManager, AnalyticsService,
// AnalyticsStore, AnalyticsMetric, AnalyticsSnapshot, AnalyticsReport,
// AnalyticsMetrics, e os contratos futuros AnalyticsProvider/
// ReportingProvider/DataWarehouseProvider/BIProvider).
//
// Consumidores fora deste módulo devem preferir `analytics` (fachada)
// — nunca AnalyticsManager/AnalyticsService/AnalyticsStore diretamente.

export * from './Analytics';
export * from './AnalyticsManager';
export * from './AnalyticsService';
export * from './AnalyticsStore';
export * from './AnalyticsMetric';
export * from './AnalyticsSnapshot';
export * from './AnalyticsReport';
export * from './AnalyticsMetrics';
export * from './AnalyticsProvider';
export * from './ReportingProvider';
export * from './DataWarehouseProvider';
export * from './BIProvider';
