// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo crm — o CRM Core completo (CRM,
// CRMManager, Customer, Interaction, Opportunity, CustomerStore,
// InteractionStore, OpportunityStore, CustomerService,
// InteractionService, OpportunityService, CRMMetrics, e os contratos
// futuros CRMImportProvider/CRMExportProvider/CRMPersistenceAdapter/
// CRMNotificationProvider/CRMSearchProvider).
//
// Consumidores fora deste módulo devem preferir `crm` (fachada) — nunca
// CRMManager/os Services/os Stores diretamente.

export * from './CRM';
export * from './CRMManager';
export * from './Customer';
export * from './Interaction';
export * from './Opportunity';
export * from './CustomerStore';
export * from './InteractionStore';
export * from './OpportunityStore';
export * from './CustomerService';
export * from './InteractionService';
export * from './OpportunityService';
export * from './CRMMetrics';
export * from './CRMImportProvider';
export * from './CRMExportProvider';
export * from './CRMPersistenceAdapter';
export * from './CRMNotificationProvider';
export * from './CRMSearchProvider';
