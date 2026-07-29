/**
 * Context — o Contexto já construído para uma solicitação de IA, pronto para qualificação,
 * orçamento e distribuição.
 * Estrutura, regras e invariantes definidas em CONTEXT_CONCRETE_STRUCTURE.md.
 */
import type { ContextLayer } from "./ContextLayer.js";
import type { ContextSource } from "./ContextSource.js";

export interface Context {
  /** Identificador do Contexto. */
  readonly contextId: string;

  /** Tenant ao qual o Contexto pertence — isolamento absoluto. */
  readonly tenantId: string;

  /** Camada hierárquica de escopo deste Contexto. */
  readonly layer: ContextLayer;

  /** Origens que compõem este Contexto. */
  readonly sources: readonly ContextSource[];

  /** Momento em que o Contexto foi criado. */
  readonly createdAt: Date;
}
