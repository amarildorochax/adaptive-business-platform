// useClients.ts
//
// Responsabilidade:
// Hook de leitura de Clientes/Contatos — busca via `CrmMockService`.

import { useCrmResource, type UseCrmResourceResult } from './useCrmResource';
import { crmMockService } from '../services';
import type { Client } from '../types';

export function useClients(): UseCrmResourceResult<Client> {
  return useCrmResource(() => crmMockService.fetchClients());
}
