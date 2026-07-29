// useNotes.ts
//
// Responsabilidade:
// Hook de leitura de Observações — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { Note } from '../types';

export function useNotes(): UseCrmResourceResult<Note> {
  return useCrmResource(() => crmMockService.fetchNotes());
}
