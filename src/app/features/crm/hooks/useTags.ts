// useTags.ts
//
// Responsabilidade:
// Hook de leitura de Etiquetas — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { Tag as TagEntity } from '../types';

export function useTags(): UseCrmResourceResult<TagEntity> {
  return useCrmResource(() => crmMockService.fetchTags());
}
