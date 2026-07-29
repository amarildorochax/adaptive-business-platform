// useAgenda.ts
//
// Responsabilidade:
// Hook de leitura da Agenda do CRM — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { AgendaEvent } from '../types';

export function useAgenda(): UseCrmResourceResult<AgendaEvent> {
  return useCrmResource(() => crmMockService.fetchAgenda());
}
