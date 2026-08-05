/**
 * Barrel export do pacote @abp/platform-services.
 * Gerado como infraestrutura de fundação (IMP-001) — reexporta cada
 * contrato já existente neste pacote, sem alterar nenhum tipo.
 * Estendido na IMP-011 (IAM Core) com Credential/Profile/RolePermission/AccessToken, seus
 * Repositórios, Serviços, e o IAMManager.
 * Estendido na IMP-015 (Knowledge Hub Core) com Repository/Service/Manager para os sete contratos já
 * existentes, mais os sete Command/Event payload novos que formalizam o catálogo já aprovado de
 * CreateKnowledge/UpdateKnowledge/IndexKnowledge/ArchiveKnowledge — ver
 * KNOWLEDGE_HUB_CORE_MIGRATION_REPORT.md.
 * Estendido na IMP-016 (Integration Hub Core) com Repository/Service/Manager para os seis contratos
 * já existentes, mais dois Command/Event payload novos que formalizam CreateConnector/RegisterWebhook
 * — ver INTEGRATION_HUB_CORE_MIGRATION_REPORT.md. WebhookValidation/ConnectorProtection/QueuedMessage
 * (`platform/packages/infrastructure/`, Component 11 — Integration Resilience) permanecem fora de
 * escopo, nunca importados aqui.
 */
export * from './AccessAuditRecord';
export * from './AccessAuditRecordRepository';
export * from './AccessAuditService';
export * from './AccessToken';
export * from './AccessTokenRepository';
export * from './ArchiveKnowledgePayload';
export * from './AuthenticationResult';
export * from './AuthenticationService';
export * from './AuthorizationDecision';
export * from './AuthorizationService';
export * from './Connector';
export * from './ConnectorConfiguration';
export * from './ConnectorConfigurationRepository';
export * from './ConnectorConfigurationService';
export * from './ConnectorContract';
export * from './ConnectorContractRepository';
export * from './ConnectorContractService';
export * from './ConnectorRepository';
export * from './ConnectorService';
export * from './CreateConnectorPayload';
export * from './CreateKnowledgePayload';
export * from './Credential';
export * from './CredentialRepository';
export * from './CredentialService';
export * from './IAMManager';
export * from './Identity';
export * from './IndexEntry';
export * from './IndexEntryRepository';
export * from './IndexKnowledgePayload';
export * from './IntegrationManager';
export * from './KnowledgeArchivedPayload';
export * from './KnowledgeAsset';
export * from './KnowledgeAssetRepository';
export * from './KnowledgeAssetService';
export * from './KnowledgeCreatedPayload';
export * from './KnowledgeIndexedPayload';
export * from './KnowledgeIndexService';
export * from './KnowledgeLifecycleService';
export * from './KnowledgeLifecycleState';
export * from './KnowledgeLifecycleStateRepository';
export * from './KnowledgeManager';
export * from './KnowledgeSearchService';
export * from './KnowledgeType';
export * from './KnowledgeUpdatedPayload';
export * from './KnowledgeVersion';
export * from './KnowledgeVersionRepository';
export * from './KnowledgeVersionService';
export * from './PlatformRoleName';
export * from './Profile';
export * from './ProfileRepository';
export * from './ProfileService';
export * from './Protocol';
export * from './RegisterWebhookPayload';
export * from './Role';
export * from './RolePermission';
export * from './RolePermissionRepository';
export * from './RolePermissionService';
export * from './Search';
export * from './SecurityContext';
export * from './SecurityContextService';
export * from './Session';
export * from './SessionRepository';
export * from './SessionService';
export * from './WebhookDelivery';
export * from './WebhookDeliveryRepository';
export * from './WebhookDeliveryService';
export * from './WebhookRegistration';
export * from './WebhookRegistrationRepository';
export * from './WebhookRegistrationService';
