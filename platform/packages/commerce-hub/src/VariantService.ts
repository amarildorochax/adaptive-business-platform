import type { Variant } from './Variant';
import type { VariantRepository } from './VariantRepository';

/** VariantService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Variant (ver relatório desta Sprint). */
export class VariantService {
  constructor(private readonly repository: VariantRepository) {}

  async create(productId: string, label: string): Promise<Variant> {
    const variant: Variant = { variantId: crypto.randomUUID(), productId, label, createdAt: new Date() };
    return this.repository.create(variant);
  }

  async get(variantId: string): Promise<Variant | undefined> {
    return this.repository.get(variantId);
  }

  async list(productId: string): Promise<readonly Variant[]> {
    return this.repository.list(productId);
  }
}
