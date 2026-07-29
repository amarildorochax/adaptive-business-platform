// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos hooks do CRM — um por entidade, mais
// `useCrmKpis` (Painel). `useCrmResource` (interno) não é reexportado
// aqui — uso exclusivo dentro de `hooks/`.

export * from './useCompanies';
export * from './useClients';
export * from './useDeals';
export * from './usePipelineStages';
export * from './useActivities';
export * from './useAgenda';
export * from './useTags';
export * from './useNotes';
export * from './useHistory';
export * from './useCrmKpis';
