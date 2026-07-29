// ModuleUnavailableError.ts
//
// Responsabilidade:
// Um módulo específico (`CoreModuleId`) não está registrado ou não
// respondeu — ex.: nenhum Adapter foi encontrado em
// `IntegrationRegistry` para o `moduleId` solicitado.

import { CoreIntegrationError } from './CoreIntegrationError';

export class ModuleUnavailableError extends CoreIntegrationError {
  readonly code = 'MODULE_UNAVAILABLE';
}
