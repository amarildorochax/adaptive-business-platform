/**
 * Contact — pessoa individual associada a exatamente um Customer ou a exatamente uma Organization por
 * vez, nunca a ambos simultaneamente de forma ambígua (Regra de negócio, Blueprint Capítulo 12).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type ContactAssociationType = "Customer" | "Organization";

export interface Contact {
  /** Identificador do Contact. */
  readonly contactId: string;

  /** Tenant ao qual o Contact pertence. */
  readonly tenantId: string;

  /** Nome da pessoa. */
  readonly name: string;

  /** Papel/cargo da pessoa dentro da Organization associada, quando aplicável. */
  readonly role?: string;

  /** E-mail de contato, quando informado. */
  readonly email?: string;

  /** Telefone de contato, quando informado. */
  readonly phone?: string;

  /** Natureza da associação — Customer ou Organization, nunca ambos. */
  readonly associationType: ContactAssociationType;

  /** Identificador opaco de Customer ou Organization, conforme associationType. */
  readonly associationId: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
