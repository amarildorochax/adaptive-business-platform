// useDeals.ts
//
// Responsabilidade:
// Hook de leitura de Negócios — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { Deal } from '../types';

export function useDeals(): UseCrmResourceResult<Deal> {
  return useCrmResource(() => crmMockService.fetchDeals());
}
