// ConflictError.ts
//
// Responsabilidade:
// A operação conflita com o estado atual do lado do Core (ex.: edição
// concorrente, recurso já existe). Sem nenhuma detecção real ainda.

import { CoreIntegrationError } from './CoreIntegrationError';

export class ConflictError extends CoreIntegrationError {
  readonly code = 'CONFLICT';
}
