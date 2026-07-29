// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo dashboard — o Adaptive Dashboard
// completo (Dashboard, DashboardManager, DashboardRefresher,
// DashboardMetrics, DashboardOverview, DashboardWidget,
// DashboardWidgetType, DashboardWidgetStatus, os oito widgets (sete da
// Sprint 8 + AnalyticsWidget da Sprint 18), DashboardAnalyticsProvider,
// DashboardSnapshotView, DashboardAnalyticsMetrics, e os contratos
// futuros DashboardLayout/DashboardUserPreferences/
// DashboardRealtimeProvider/DashboardExport/DashboardNotification).
//
// Consumidores fora deste módulo devem preferir `dashboard` (fachada) —
// nunca DashboardManager/DashboardRefresher/DashboardMetrics ou os
// widgets diretamente.

export * from './Dashboard';
export * from './DashboardManager';
export * from './DashboardRefresher';
export * from './DashboardMetrics';
export * from './DashboardOverview';
export * from './DashboardWidget';
export * from './DashboardWidgetType';
export * from './DashboardWidgetStatus';
export * from './RuntimeWidget';
export * from './EventBusWidget';
export * from './MemoryWidget';
export * from './WorkflowWidget';
export * from './AgentWidget';
export * from './KnowledgeWidget';
export * from './AIGatewayWidget';
export * from './AnalyticsWidget';
export * from './DashboardAnalyticsProvider';
export * from './DashboardSnapshotView';
export * from './DashboardAnalyticsMetrics';
export * from './DashboardLayout';
export * from './DashboardUserPreferences';
export * from './DashboardRealtimeProvider';
export * from './DashboardExport';
export * from './DashboardNotification';
