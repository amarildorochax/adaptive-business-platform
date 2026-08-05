/**
 * Barrel export do pacote @abp/ai-agents.
 * Gerado como infraestrutura de fundação (IMP-001) — reexporta cada
 * contrato já existente neste pacote, sem alterar nenhum tipo.
 * Estendido pela IMP-014 (AI Agents Core) com Repository, Service e Manager para os quatro contratos
 * já existentes — nenhuma Entity nova foi criada; ver AI_AGENTS_CORE_MIGRATION_REPORT.md.
 */
export * from './AIAgentsCoreDelegationComponent';
export * from './AIAgentsHumanOversightComponent';
export * from './AgentCapabilityRequest';
export * from './AgentDelegationRecord';
export * from './AgentTaskResult';
export * from './OversightCheckpoint';

// IMP-014 — AI Agents Core
export * from './AgentCapabilityRequestRepository';
export * from './AgentCapabilityRequestService';
export * from './AgentDelegationRecordRepository';
export * from './AgentTaskResultRepository';
export * from './AIAgentsManager';
export * from './DelegationCoordinatorService';
export * from './OversightCheckpointRepository';
export * from './OversightGateService';
export * from './TaskResultHandlerService';
