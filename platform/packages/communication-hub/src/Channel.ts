/**
 * Channel — o meio de comunicação em si (WhatsApp, e-mail, notificação), como conceito abstrato,
 * distinto da conta concreta que o opera (Channel Account). Nenhum componente do Communication Hub
 * contém lógica específica de um Canal — essa especificidade pertence ao Integration Hub.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Channel {
  /** Identificador do Channel. */
  readonly channelId: string;

  /** Nome do Channel (ex.: WhatsApp, E-mail, Notificação). */
  readonly name: string;
}
