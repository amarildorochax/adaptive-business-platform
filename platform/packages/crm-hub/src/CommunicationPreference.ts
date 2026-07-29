/**
 * Communication Preference — a preferência de canal e de frequência de contato de uma parte externa,
 * consumida pelo Communication Hub no momento de decidir como e quando contatá-la.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface CommunicationPreference {
  /** Relationship ao qual esta preferência se refere. */
  readonly relationshipId: string;

  /** Canal preferencial de contato. */
  readonly preferredChannel: string;

  /** Frequência de contato preferencial. */
  readonly frequency: string;
}
