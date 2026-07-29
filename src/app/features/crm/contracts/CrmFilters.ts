// CrmFilters.ts
//
// Responsabilidade:
// Contrato de filtro/busca genérico do CRM — consumido pelas páginas
// de listagem (Empresas/Clientes/Negócios). Nenhuma página desta
// Sprint implementa todos os campos ao mesmo tempo; o contrato é
// deliberadamente mais amplo que o uso atual, para não exigir
// alteração quando um filtro adicional for ligado.

export interface CrmFilters {
  search?: string;
  status?: string;
  ownerName?: string;
  tagIds?: string[];
}
