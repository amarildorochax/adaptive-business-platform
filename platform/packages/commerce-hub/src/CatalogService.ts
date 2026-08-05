import type { Catalog } from './Catalog';
import type { CatalogRepository } from './CatalogRepository';

/** CatalogService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Catalog em si (ver relatório desta Sprint). */
export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}

  async create(tenantId: string, name: string): Promise<Catalog> {
    const catalog: Catalog = { catalogId: crypto.randomUUID(), tenantId, name, createdAt: new Date() };
    return this.repository.create(catalog);
  }

  async get(catalogId: string): Promise<Catalog | undefined> {
    return this.repository.get(catalogId);
  }

  async list(tenantId: string): Promise<readonly Catalog[]> {
    return this.repository.list(tenantId);
  }
}
