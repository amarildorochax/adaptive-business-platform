import type { Category } from './Category';

/** CategoryRepository — contrato de persistência de Category. Interface apenas, per IMP-004, Etapa 7. */
export interface CategoryRepository {
  create(category: Category): Promise<Category>;
  get(categoryId: string): Promise<Category | undefined>;
  list(tenantId: string): Promise<readonly Category[]>;
}
