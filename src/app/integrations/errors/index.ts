// index.ts
//
// Responsabilidade:
// Ponto único de exportação da hierarquia de erros da camada de
// integração — CoreUnavailable, ModuleUnavailable, PermissionDenied,
// Validation, Conflict, Timeout, Unexpected, mais o normalizador usado
// pelos Hooks.

export * from './CoreIntegrationError';
export * from './CoreUnavailableError';
export * from './ModuleUnavailableError';
export * from './PermissionDeniedError';
export * from './ValidationError';
export * from './ConflictError';
export * from './TimeoutError';
export * from './UnexpectedError';
export * from './normalizeError';
