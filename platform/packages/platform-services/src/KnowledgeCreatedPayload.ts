/**
 * Knowledge Created Payload — conteúdo do evento "KnowledgeCreated" (`EVENT_CATALOG.md`: "registrar
 * novo Document indexado na Knowledge Base... Payload conceitual: identificador, tipo de conteúdo"),
 * consumível pelo contrato genérico Event<TPayload> já implementado em @abp/core, nunca redefinido
 * aqui — mesma disciplina já aplicada a `KnowledgeUpdatedPayload.ts`.
 */
import type { KnowledgeType } from "./KnowledgeType.js";

export interface KnowledgeCreatedPayload {
  /** Ativo criado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;

  /** Tipo do ativo criado. */
  readonly type: KnowledgeType;
}
