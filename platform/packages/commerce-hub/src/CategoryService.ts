import type { Category } from './Category';
import type { CategoryRepository } from './CategoryRepository';

/** CategoryService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Category (ver relatório desta Sprint). */
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async create(tenantId: string, name: string, parentCategoryId?: string): Promise<Category> {
    const category: Category = {
      categoryId: crypto.randomUUID(),
      tenantId,
      name,
      parentCategoryId,
      createdAt: new Date(),
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
