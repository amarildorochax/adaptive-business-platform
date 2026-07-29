/**
 * Generic Event — forma estrutural genérica de fato de negócio já consumado.
 * Estrutura, regras e invariantes definidas em SHARED_TYPES_CONCRETE_STRUCTURE.md.
 */
export interface Event<TPayload = unknown> {
  /** Identificador único que permite deduplicação e correlação. */
  readonly id: string;

  /** Momento exato do fato de negócio, distinto do momento técnico de publicação. */
  readonly occurredAt: Date;

  /** Identificador do Aggregate cujo estado este Evento descreve. */
  readonly aggregateId: string;

  /** Versão explícita do contrato deste Evento. */
  readonly contractVersion: string;

  /** Identificador nomeado no particípio passado, refletindo fato já consumado (ex.: "CustomerCreated"). */
  readonly name: string;

  /** Conteúdo específico de domínio do fato ocorrido — opaco à forma genérica. */
  readonly payload: TPayload;
}
