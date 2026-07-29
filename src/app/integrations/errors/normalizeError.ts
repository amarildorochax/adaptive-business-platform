// normalizeError.ts
//
// Responsabilidade:
// Converte qualquer erro desconhecido (lançado por um Adapter ou por
// código externo) em um `CoreIntegrationError` — usado pelos Hooks
// (`useCoreQuery`/`useCoreMutation`) para garantir que a UI nunca
// recebe um erro cru, não tipado.

import { CoreIntegrationError } from './CoreIntegrationError';
import { UnexpectedError } from './UnexpectedError';

export function normalizeError(error: unknown, moduleId?: string): CoreIntegrationError {
  if (error instanceof CoreIntegrationError) return error;
  const message = error instanceof Error ? error.message : 'Erro desconhecido na camada de integração.';
  return new UnexpectedError(message, moduleId);
}
