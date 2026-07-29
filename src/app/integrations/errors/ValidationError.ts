// ValidationError.ts
//
// Responsabilidade:
// Um `CoreRequest`/comando falhou uma validação antes (ou depois) de
// alcançar o Adapter — carrega `fieldErrors` opcional para apontar
// quais campos falharam.

import { CoreIntegrationError } from './CoreIntegrationError';

export class ValidationError extends CoreIntegrationError {
  readonly code = 'VALIDATION_ERROR';
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>, moduleId?: string) {
    super(message, moduleId);
    this.fieldErrors = fieldErrors;
  }
}
