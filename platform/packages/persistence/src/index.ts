/**
 * Barrel export do pacote @abp/persistence (FUN-003 — Real Persistence Layer Foundation).
 * Implementações concretas de Repository Interfaces já aprovadas de `@abp/business-profile`,
 * `@abp/branding` e `@abp/crm-hub` — nunca uma redefinição delas. Pacote Node-only (`better-sqlite3`
 * é um addon nativo) — nunca importado pelo bundle de navegador de `apps/web` (ver
 * `FUN_003_REAL_PERSISTENCE_LAYER_REPORT.md`, Seção "Frontend").
 */
export * from "./composition/createManagerRegistry.js";
export * from "./db/client.js";
export * from "./db/config.js";
export * from "./db/migrate.js";
export * from "./repositories/branding/SqliteBrandThemeRepository.js";
export * from "./repositories/branding/SqliteDesignTokenRepository.js";
export * from "./repositories/branding/SqliteLogoRepository.js";
export * from "./repositories/business-profile/SqliteBusinessClassificationRecordRepository.js";
export * from "./repositories/business-profile/SqliteBusinessProfileLifecycleStateRepository.js";
export * from "./repositories/business-profile/SqliteBusinessProfileRepository.js";
export * from "./repositories/business-profile/SqliteMaturityRecordRepository.js";
export * from "./repositories/crm/SqliteContactRepository.js";
export * from "./repositories/crm/SqliteCustomerRepository.js";
export * from "./repositories/crm/SqliteLeadRepository.js";
export * from "./repositories/crm/SqliteOpportunityRepository.js";
export * from "./repositories/crm/SqliteOrganizationRepository.js";
export * from "./repositories/crm/SqliteRelationshipRepository.js";
export * from "./repositories/crm/SqliteTimelineEventRepository.js";
export * from "./repositories/iam/SqliteAccessAuditRecordRepository.js";
export * from "./repositories/iam/SqliteAccessTokenRepository.js";
export * from "./repositories/iam/SqliteCredentialRepository.js";
export * from "./repositories/iam/SqliteProfileRepository.js";
export * from "./repositories/iam/SqliteRolePermissionRepository.js";
export * from "./repositories/iam/SqliteSessionRepository.js";
export * from "./repositories/inventory-movement/SqliteStockAlertRuleRepository.js";
export * from "./repositories/inventory-movement/SqliteStockLocationRepository.js";
export * from "./repositories/inventory-movement/SqliteStockMovementRepository.js";
export * from "./repositories/inventory-movement/SqliteStockPositionRepository.js";
export * from "./repositories/inventory-movement/SqliteStockReservationRepository.js";
export * from "./repositories/production/SqliteBillOfMaterialsRepository.js";
export * from "./repositories/production/SqliteProductionOrderRepository.js";
export * from "./repositories/production/SqliteWorkCenterRepository.js";
export * from "./repositories/purchase/SqlitePurchaseOrderRepository.js";
export * from "./repositories/purchase/SqlitePurchaseRequisitionRepository.js";
export * from "./repositories/purchase/SqliteReceivingRepository.js";
export * from "./repositories/purchase/SqliteReorderRuleRepository.js";
export * from "./repositories/supplier/SqliteSupplierCatalogItemRepository.js";
export * from "./repositories/supplier/SqliteSupplierContractRepository.js";
export * from "./repositories/supplier/SqliteSupplierPerformanceRepository.js";
export * from "./repositories/supplier/SqliteSupplierRepository.js";
