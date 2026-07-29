/**
 * Role / Permission — Papel é o agrupamento reutilizável de Permissões; Permissão é a unidade atômica de
 * autorização, resolvida em tempo de requisição, nunca armazenada como lista estática e fixa.
 * Estrutura definida em IDENTITY_CONCRETE_STRUCTURE.md.
 */
export type Role = string;

export interface Permission {
  /** Nome da Permissão. */
  readonly name: string;
}
