import type { Variant } from './Variant';

/** Contrato de persistência de Variant — apenas o contrato, per Etapa 7. */
export interface VariantRepository {
  create(variant: Variant): Promise<Variant>;
  get(variantId: string): Promise<Variant | undefined>;
  list(productId: string): Promise<Variant[]>;
}
