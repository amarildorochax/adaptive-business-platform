import type { Category } from './Category';

/** Contrato de persistência de Category — apenas o contrato, per Etapa 7. */
export interface CategoryRepository {
  create(category: Category): Promise<Category>;
  get(categoryId: string): Promise<Category | undefined>;
  list(tenantId: string): Promise<Category[]>;
}
