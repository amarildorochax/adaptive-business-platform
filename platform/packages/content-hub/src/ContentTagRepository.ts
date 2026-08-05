import type { ContentTag } from './ContentTag';

/** ContentTagRepository — contrato de persistência de ContentTag. Interface apenas, per IMP-004, Etapa 7. */
export interface ContentTagRepository {
  create(tag: ContentTag): Promise<ContentTag>;
  get(contentTagId: string): Promise<ContentTag | undefined>;
  list(tenantId: string): Promise<readonly ContentTag[]>;
}
