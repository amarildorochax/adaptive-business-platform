// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos tipos da camada de integração —
// identificador de módulo, contratos de autenticação (Identity/Session/
// UserContext/AccessToken/RefreshToken) e de observabilidade.

export * from './ModuleId';
export * from './Identity';
export * from './AccessToken';
export * from './Session';
export * from './UserContext';
export * from './Observability';
