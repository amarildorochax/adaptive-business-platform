/**
 * Barrel export do pacote @abp/business-profile.
 * Criado do zero pela IMP-018 (Business Profile Engine Core) — nenhum scaffolding prévio existia
 * (confirmado pela auditoria pós-IMP-017, `POST_IMPLEMENTATION_ARCHITECTURE_AUDIT.md`). Pacote
 * dedicado, distinto de `@abp/platform-services` — Business Profile Engine pertence à categoria
 * arquitetural "Adaptive Intelligence" (`SYSTEM_BLUEPRINT.md`; `DOMAIN_OWNERSHIP_MATRIX.md`, linha
 * 276: "Adaptive Intelligence: AI · Business Profile · Branding"), nunca a "Platform Services"
 * (Identity/Knowledge/Integration) — ver `BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Decisões
 * Arquiteturais.
 */
export * from './BusinessClassification';
export * from './BusinessClassificationRecord';
export * from './BusinessClassificationRecordRepository';
export * from './BusinessClassificationService';
export * from './BusinessMaturityService';
export * from './BusinessProfile';
export * from './BusinessProfileCommand';
export * from './BusinessProfileEvent';
export * from './BusinessProfileLifecycleService';
export * from './BusinessProfileLifecycleState';
export * from './BusinessProfileLifecycleStateRepository';
export * from './BusinessProfileManager';
export * from './BusinessProfileRepository';
export * from './BusinessProfileService';
export * from './CreateBusinessProfilePayload';
export * from './Maturity';
export * from './MaturityRecord';
export * from './MaturityRecordRepository';
export * from './Segment';
