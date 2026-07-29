// useHistory.ts
//
// Responsabilidade:
// Hook de leitura do Histórico (linha do tempo) — busca via
// `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { HistoryEntry } from '../types';

export function useHistory(): UseCrmResourceResult<HistoryEntry> {
  return useCrmResource(() => crmMockService.fetchHistory());
}
