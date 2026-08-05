export interface CategoryBadgeProps {
  readonly name: string;
}

/**
 * Rótulo compacto de uma Category — distinto de `Badge` (tom semântico de status) por representar
 * puramente uma etiqueta de organização/agrupamento, nunca um estado. Primeiro uso no Product Hub
 * Workspace (FUN-104, `Category` do Commerce Hub), genérico para qualquer módulo futuro com o mesmo
 * conceito de categorização hierárquica.
 */
export function CategoryBadge({ name }: CategoryBadgeProps) {
  return <span className="category-badge">{name}</span>;
}
