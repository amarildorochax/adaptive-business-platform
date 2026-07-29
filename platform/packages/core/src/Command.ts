/**
 * Generic Command — forma estrutural genérica de intenção de mudança de estado.
 * Estrutura, regras e invariantes definidas em SHARED_TYPES_CONCRETE_STRUCTURE.md.
 */
export interface Command<TPayload = unknown> {
  /** Identificador nomeado da operação solicitada (ex.: "CreateCustomer"). */
  readonly name: string;

  /** Identificador único da solicitação, usado para verificação de idempotência quando aplicável. */
  readonly submissionId?: string;

  /** Parâmetros da operação solicitada — opaco à forma genérica, definido por domínio. */
  readonly payload: TPayload;

  /** Versão explícita do contrato deste Command. */
  readonly contractVersion: string;
}
