// useActivities.ts
//
// Responsabilidade:
// Hook de leitura de Atividades — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { Activity } from '../types';

export function useActivities(): UseCrmResourceResult<Activity> {
  return useCrmResource(() => crmMockService.fetchActivities());
}
