// FeatureFlagsMiddleware.ts
//
// Responsabilidade:
// Consome o contrato de feature flags já reaproveitado da Sprint 29A
// (`contracts/featureFlags.ts` → `@/app/features/dashboard/controllers/
// featureFlags`). Com `defaultWidgetFeatureFlags` (tudo habilitado),
// nunca bloqueia uma execução — nenhuma regra real é imposta.

import { defaultWidgetFeatureFlags } from '../contracts/featureFlags';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const featureFlagsMiddleware: PipelineMiddleware = {
  name: 'feature-flags',
  priority: 60,

  shouldExecute(): boolean {
    return defaultWidgetFeatureFlags.enabled && !defaultWidgetFeatureFlags.hidden;
  },

  beforeExecute(context: PipelineContext): PipelineContext {
    return context;
  },
};
