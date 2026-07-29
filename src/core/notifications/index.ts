// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo notifications — o Notification
// Hub completo (Notifications, NotificationManager, NotificationService,
// NotificationStore, NotificationRecord, NotificationChannel,
// NotificationRecipient, NotificationDelivery, NotificationMetrics, e
// os contratos futuros EmailProvider/WhatsAppProvider/PushProvider/
// SmsProvider/WebhookProvider).
//
// Nota: `EmailProvider`/`WhatsAppProvider` colidem de nome com
// `@/core/marketing/EmailProvider.ts`/`WhatsAppProvider.ts` (Sprint 10,
// também contratos futuros nunca implementados). Por isso,
// deliberadamente, `core/index.ts` (o barrel de topo) NÃO agrega este
// módulo via `export *` — mesmo princípio já usado na colisão
// `WorkflowEngine` (Sprint Workflow Engine). Este barrel, porém,
// permanece completo — todo consumo real usa caminhos profundos
// (ex.: `@/core/notifications`), nunca o barrel de topo `@/core`.
//
// Nota (Etapa 24A — Correção 03): `NotificationStore` deixou de ser
// reexportado por este barrel — verificado que nenhum consumidor fora
// deste módulo o importava, e a classe não define nenhum tipo público
// adicional. `NotificationManager`/`NotificationService` permanecem
// exportados: `NotificationService.ts` define, no mesmo arquivo, os
// tipos públicos de entrada (`NotificationInput`/
// `NotificationChannelInput`/`NotificationRecipientInput`/
// `RegisterDeliveryInput`) — removê-los seria inseguro.
//
// Consumidores fora deste módulo devem preferir `notifications`
// (fachada) — nunca NotificationManager/NotificationService/
// NotificationStore diretamente.

export * from './Notifications';
export * from './NotificationManager';
export * from './NotificationService';
export * from './NotificationRecord';
export * from './NotificationChannel';
export * from './NotificationRecipient';
export * from './NotificationDelivery';
export * from './NotificationMetrics';
export * from './EmailProvider';
export * from './WhatsAppProvider';
export * from './PushProvider';
export * from './SmsProvider';
export * from './WebhookProvider';
