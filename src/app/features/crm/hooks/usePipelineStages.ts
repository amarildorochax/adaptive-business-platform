// usePipelineStages.ts
//
// Responsabilidade:
// Hook de leitura das etapas do Pipeline de vendas — busca via
// `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { CrmPipelineStage } from '../types';

export function usePipelineStages(): UseCrmResourceResult<CrmPipelineStage> {
  return useCrmResource(() => crmMockService.fetchPipelineStages());
}
