import type { Audience } from './Audience';

/**
 * Contrato de persistência de Audience — apenas o contrato, per Etapa 7 (IMP-005). Nunca declara
 * `update`: uma Audience é construída uma vez (`AudienceBuilt`, o único Evento aprovado para esta
 * Entidade); uma nova composição é uma nova Audience, nunca uma sobrescrita da anterior.
 */
export interface AudienceRepository {
  create(audience: Audience): Promise<Audience>;
  get(audienceId: string): Promise<Audience | undefined>;
  list(tenantId: string): Promise<Audience[]>;
}
