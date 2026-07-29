/**
 * Ownership Contract — fronteira abstrata de propriedade exclusiva de um conceito.
 * Estrutura, regras e invariantes definidas em BASE_CONTRACTS_CONCRETE_STRUCTURE.md.
 */
export interface Owned {
  /** Identificador nomeado do único módulo autorizado a criar, alterar e publicar Evento sobre este conceito. */
  readonly ownerModule: string;
}
