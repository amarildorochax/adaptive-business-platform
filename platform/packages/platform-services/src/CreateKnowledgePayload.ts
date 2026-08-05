/**
 * Create Knowledge Payload — conteúdo do Command "CreateKnowledge" (`COMMAND_CATALOG.md`: "registrar
 * novo Document na Knowledge Base"), consumível pelo contrato genérico Command<TPayload> já
 * implementado em @abp/core, nunca redefinido aqui — mesma disciplina já aplicada a
 * `KnowledgeUpdatedPayload.ts`.
 */
import type { KnowledgeType } from "./KnowledgeType.js";

export interface CreateKnowledgePayload {
  /** Tenant ao qual o novo ativo pertencerá — isolamento absoluto (ADR-011). */
  readonly tenantId: string;

  /** Tipo do ativo, entre os doze já catalogados no Modelo de Conhecimento (Capítulo 8). */
  readonly type: KnowledgeType;

  /** Categoria do ativo, quando já conhecida no momento da criação. */
  readonly category?: string;

  /** Tags associadas ao ativo. */
  readonly tags: readonly string[];
}
