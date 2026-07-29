// UnexpectedError.ts
//
// Responsabilidade:
// Qualquer falha que não se encaixe nos demais subtipos — usado como
// fallback ao normalizar um erro desconhecido lançado por um Adapter.

import { CoreIntegrationError } from './CoreIntegrationError';

export class UnexpectedError extends CoreIntegrationError {
  readonly code = 'UNEXPECTED';
}
