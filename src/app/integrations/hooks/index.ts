// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos Hooks públicos da camada de integração
// — useCoreModule, useCoreQuery, useCoreMutation, useCoreHealth,
// useCoreStatus. Nenhum conhece implementação interna de Adapter;
// todos dependem apenas do contrato `CoreModuleAdapter`.
//
// `useIntegrationContext` é uso interno (não reexportado aqui).

export * from './useCoreModule';
export * from './useCoreQuery';
export * from './useCoreMutation';
export * from './useCoreHealth';
export * from './useCoreStatus';
