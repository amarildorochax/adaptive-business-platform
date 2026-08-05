/**
 * Author — autoria editorial, humana ou Agente de IA, proprietária do CMS Engine. Quando humana,
 * referencia um usuário do Identity Hub por identificador opaco (`referenceId`) — nunca duplica a
 * Entidade `Identity`, per `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22, e o princípio de isolamento
 * entre Business Hubs e Platform Services já exigido por `PACKAGE_STRUCTURE_MANIFEST.md`.
 * Estrutura definida em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 */
export type AuthorStatus = 'Active' | 'Inactive';

export interface Author {
  /** Identificador do Author. */
  readonly authorId: string;

  /** Tenant ao qual o Author pertence. */
  readonly tenantId: string;

  /** Nome de exibição do Author. */
  readonly name: string;

  /** Se este Author é um Agente de IA — nunca um humano duplicado do Identity Hub. */
  readonly isAgent: boolean;

  /** Identificador opaco do usuário no Identity Hub, quando `isAgent` é falso. */
  readonly identityReferenceId?: string;

  /** Estado atual. */
  readonly status: AuthorStatus;

  /** Momento de criação. */
  readonly createdAt: Date;
}
