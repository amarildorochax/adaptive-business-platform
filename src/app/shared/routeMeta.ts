// routeMeta.ts
//
// Responsabilidade:
// Contrato de metadados anexável a uma rota do AppRouter — título de
// página, layout a ser usado e exigência (ou não) de autenticação. Não
// contém nenhuma rota real, apenas o tipo que `router/routes.tsx`
// consome.

export type LayoutName = 'app' | 'auth' | 'empty' | 'dashboard' | 'workspace';

export interface RouteMeta {
  title?: string;
  layout?: LayoutName;
  protected?: boolean;
}
