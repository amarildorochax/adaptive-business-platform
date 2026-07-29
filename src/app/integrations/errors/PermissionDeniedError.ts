// PermissionDeniedError.ts
//
// Responsabilidade:
// O `UserContext` atual não tem permissão para a operação solicitada.
// Nenhuma política real de permissão avalia isso ainda (ver
// `contracts` reaproveitados da Sprint 29A).

import { CoreIntegrationError } from './CoreIntegrationError';

export class PermissionDeniedError extends CoreIntegrationError {
  readonly code = 'PERMISSION_DENIED';
}
