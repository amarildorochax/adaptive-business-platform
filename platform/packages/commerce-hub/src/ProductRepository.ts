import type { Product } from './Product';

/** Contrato de persistência de Product — apenas o contrato, per Etapa 7. Nunca declara `remove` — Soft Delete via `status: 'Discontinued'`. */
export interface ProductRepository {
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  get(productId: string): Promise<Product | undefined>;
  list(catalogId: string): Promise<Product[]>;
}
