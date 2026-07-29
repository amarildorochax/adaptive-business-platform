// TimeoutError.ts
//
// Responsabilidade:
// A operação excedeu o tempo limite esperado. Nenhum Adapter aplica um
// timeout real ainda.

import { CoreIntegrationError } from './CoreIntegrationError';

export class TimeoutError extends CoreIntegrationError {
  readonly code = 'TIMEOUT';
}
