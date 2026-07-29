/**
 * Logger — capacidade abstrata de registro de evento técnico, estruturada e correlacionável.
 * Estrutura, regras e invariantes definidas em LOGGING_CONCRETE_STRUCTURE.md.
 */
export interface LogEntry {
  /** Conteúdo estruturado do registro técnico. */
  readonly message: string;

  /** Identificador único que acompanha a requisição de ponta a ponta — obrigatório. */
  readonly correlationId: string;

  /** Instante em que o evento técnico ocorreu. */
  readonly timestamp: Date;
}

export interface Logger {
  /** Registra um evento técnico estruturado e correlacionável. */
  record(entry: LogEntry): void;
}
