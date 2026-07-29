// useCompanies.ts
//
// Responsabilidade:
// Hook de leitura de Empresas — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { Company } from '../types';

export function useCompanies(): UseCrmResourceResult<Company> {
  return useCrmResource(() => crmMockService.fetchCompanies());
}
