import type { Author } from './Author';
import type { AuthorRepository } from './AuthorRepository';

/** Campos aceitos por `AuthorService.create()`. */
export type CreateAuthorInput = Pick<Author, 'tenantId' | 'name' | 'isAgent' | 'identityReferenceId'>;

/**
 * AuthorService — administra a autoria editorial, humana ou Agente de IA. Nunca duplica a
 * Entidade `Identity` do Identity Hub — `identityReferenceId` é sempre um identificador opaco,
 * nunca um objeto copiado (`CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22; `PACKAGE_STRUCTURE_MANIFEST.md`,
 * §5). Inexistente em `src/core` ou `src/app` (IMP-004, Etapa 1); construído diretamente sobre o
 * contrato já descrito.
 */
export class AuthorService {
  constructor(private readonly repository: AuthorRepository) {}

  async create(input: CreateAuthorInput): Promise<Author> {
    const author: Author = {
      authorId: crypto.randomUUID(),
      status: 'Active',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(author);
  }

  async get(authorId: string): Promise<Author | undefined> {
    return this.repository.get(authorId);
  }

  async list(tenantId: string): Promise<readonly Author[]> {
    return this.repository.list(tenantId);
  }
}
