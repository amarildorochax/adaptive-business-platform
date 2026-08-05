import type { Author } from './Author';

/** AuthorRepository — contrato de persistência de Author. Interface apenas, per IMP-004, Etapa 7. */
export interface AuthorRepository {
  create(author: Author): Promise<Author>;
  get(authorId: string): Promise<Author | undefined>;
  list(tenantId: string): Promise<readonly Author[]>;
}
