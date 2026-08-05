import type { Category } from './Category';
import type { CategoryRepository } from './CategoryRepository';

/** Campos aceitos por `CategoryService.create()`. */
export type CreateCategoryInput = Pick<Category, 'tenantId' | 'name'>;

/**
 * CategoryService — administra a Taxonomia do CMS Engine (Category). Inexistente em `src/core` ou
 * `src/app` (IMP-004, Etapa 1); construído diretamente sobre o contrato já descrito em
 * `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 */
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async create(input: CreateCategoryInput): Promise<Category> {
    const category: Category = {
      categoryId: crypto.randomUUID(),
      status: 'Active',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(category);
  }

  async get(categoryId: string): Promise<Category | undefined> {
    return this.repository.get(categoryId);
  }

  async list(tenantId: string): Promise<readonly Category[]> {
    return this.repository.list(tenantId);
  }
}
