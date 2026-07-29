/**
 * Context Version — registro de uma versão de Contexto; a versão anterior permanece válida para
 * solicitação já em processamento no momento de uma mudança estrutural.
 * Estrutura definida em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export interface ContextVersion {
  /** Contexto versionado. */
  readonly contextId: string;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi substituída, quando aplicável. */
  readonly supersededAt?: Date;
}
