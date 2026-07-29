// Identity.ts
//
// Responsabilidade:
// Contrato de identidade do usuário autenticado — preparação
// arquitetural para uma Sprint futura de Auth. Nenhuma autenticação
// real ocorre nesta Sprint.

export interface Identity {
  id: string;
  displayName: string;
  email?: string;
}
