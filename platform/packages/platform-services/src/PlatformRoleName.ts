/**
 * Platform Role Name — os oito Papéis já nomeados em `SAAS_ARCHITECTURE.md`, Capítulo 11, e
 * reafirmados em `IDENTITY_HUB.md`, Capítulo 8: "Perfil, Papel e Permissão já foram introduzidos em
 * `SAAS_ARCHITECTURE.md`, Capítulo 11, com oito Papéis nomeados". Hierarquia: Owner → Administrador
 * → (Gerente, Financeiro, Marketing) → (Operador, Atendimento) → Convidado.
 *
 * Deliberadamente um tipo **adicional**, nunca uma alteração de `Role.ts` — `Role` permanece `string`
 * exatamente como já aprovado ("Permissão... nunca armazenada como lista estática e fixa"; o mesmo
 * espírito de flexibilidade se aplica a `Role`). `PlatformRoleName` é o catálogo dos nomes já
 * conhecidos, consumido pelo RBAC Engine desta Sprint, nunca um tipo fechado que `Role` deveria
 * adotar.
 */
export type PlatformRoleName =
  | 'Owner'
  | 'Administrador'
  | 'Gerente'
  | 'Financeiro'
  | 'Marketing'
  | 'Operador'
  | 'Atendimento'
  | 'Convidado';
