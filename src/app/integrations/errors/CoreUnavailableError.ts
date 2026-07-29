// CoreUnavailableError.ts
//
// Responsabilidade:
// O Core como um todo está inacessível (ex.: `startPlatform()` ainda
// não rodou, ou uma Sprint futura de transporte real falhou ao
// conectar). Distinto de `ModuleUnavailableError` (só um módulo
// específico falhou).

import { CoreIntegrationError } from './CoreIntegrationError';

export class CoreUnavailableError extends CoreIntegrationError {
  readonly code = 'CORE_UNAVAILABLE';
}
