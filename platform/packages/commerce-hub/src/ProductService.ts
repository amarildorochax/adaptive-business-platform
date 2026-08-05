import type { Product } from './Product';
import type { ProductRepository } from './ProductRepository';

/** Campos aceitos por `ProductService.create()`. */
export type CreateProductInput = Pick<Product, 'tenantId' | 'catalogId' | 'categoryId' | 'name' | 'description'>;

/**
 * ProductService — nenhum precedente legado foi encontrado (`src/core/catalog` é o catálogo de
 * Agentes de IA, não de Product; ver relatório desta Sprint). Ciclo de vida per Capítulo 10:
 * `Draft → Published → Discontinued`, nunca removido fisicamente. Nenhuma emissão de Evento aqui —
 * responsabilidade exclusiva de CommerceManager.
 */
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async create(input: CreateProductInput): Promise<Product> {
    const now = new Date();
    const product: Product = {
      productId: crypto.randomUUID(),
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    return this.repository.create(product);
  }

  async update(productId: string, input: Partial<CreateProductInput>): Promise<Product> {
    const existing = await this.repository.get(productId);

    if (!existing) {
      throw new Error(`Product ${productId} não encontrado.`);
    }

    return this.repository.update({ ...existing, ...input, updatedAt: new Date() });
  }

  async publish(productId: string): Promise<Product> {
    const existing = await this.repository.get(productId);

    if (!existing) {
      throw new Error(`Product ${productId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status: 'Published', updatedAt: new Date() });
  }

  async discontinue(productId: string): Promise<Product> {
    const existing = await this.repository.get(productId);

    if (!existing) {
      throw new Error(`Product ${productId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status: 'Discontinued', updatedAt: new Date() });
  }

  async get(productId: string): Promise<Product | undefined> {
    return this.repository.get(productId);
  }

  async list(catalogId: string): Promise<readonly Product[]> {
    return this.repository.list(catalogId);
  }
}
