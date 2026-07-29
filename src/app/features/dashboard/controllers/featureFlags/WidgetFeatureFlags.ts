// WidgetFeatureFlags.ts
//
// Responsabilidade:
// Estrutura de feature flags por widget — preparação arquitetural
// exigida pela Sprint 29A. NENHUMA implementação real (nenhum provider
// de flags externo é consultado): `defaultWidgetFeatureFlags` é o valor
// padrão usado até uma Sprint futura conectar um provider real.

export interface WidgetFeatureFlags {
  enabled: boolean;
  experimental: boolean;
  beta: boolean;
  hidden: boolean;
}

/** Todo widget habilitado e visível por padrão — nenhuma flag ativa. */
export const defaultWidgetFeatureFlags: WidgetFeatureFlags = {
  enabled: true,
  experimental: false,
  beta: false,
  hidden: false,
};
