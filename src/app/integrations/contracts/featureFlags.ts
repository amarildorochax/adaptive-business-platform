// featureFlags.ts
//
// Responsabilidade:
// Reexporta o contrato de feature flags já criado na Sprint 29A
// (`@/app/features/dashboard/controllers/featureFlags`) — a camada de
// integração não define um segundo contrato; reutiliza
// `WidgetFeatureFlags`/`defaultWidgetFeatureFlags` (nenhuma
// implementação real).

export type { WidgetFeatureFlags } from '@/app/features/dashboard/controllers/featureFlags';
export { defaultWidgetFeatureFlags } from '@/app/features/dashboard/controllers/featureFlags';
