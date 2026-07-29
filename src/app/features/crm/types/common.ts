// common.ts
//
// Responsabilidade:
// Tipos compartilhados entre as entidades do CRM — status genérico e o
// identificador de "tipo de entidade relacionada", usado por
// `Note`/`HistoryEntry` para apontar para Empresa/Cliente/Negócio sem
// precisar de um campo de relação por tipo.

export type CrmEntityType = 'company' | 'client' | 'deal';

export type CrmRecordStatus = 'active' | 'inactive' | 'archived';
