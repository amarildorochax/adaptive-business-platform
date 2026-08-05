import type { Catalog } from './Catalog';

/** Contrato de persistência de Catalog — apenas o contrato, per Etapa 7. */
export interface CatalogRepository {
  create(catalog: Catalog): Promise<Catalog>;
  get(catalogId: string): Promise<Catalog | undefined>;
  list(tenantId: string): Promise<Catalog[]>;
}
