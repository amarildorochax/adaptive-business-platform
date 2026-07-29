/**
 * Participant — qualquer parte envolvida em uma Conversation, o Usuário da Empresa ou a parte
 * externa, cada um referenciado por identificador, sem que o Communication Hub duplique o Domain
 * Model completo de nenhuma dessas partes, que pertence a outro Hub quando aplicável.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type ParticipantType = "Internal" | "External";

export interface Participant {
  /** Conversation à qual este Participant pertence. */
  readonly conversationId: string;

  /** Se o Participant é interno (Usuário da Empresa) ou externo. */
  readonly type: ParticipantType;

  /** Identificador opaco do Participant — nunca uma cópia do Domain Model de outro Hub. */
  readonly referenceId: string;
}
