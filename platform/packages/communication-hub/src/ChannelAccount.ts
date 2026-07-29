/**
 * Channel Account — a instância concreta de um Channel operada pela Empresa (ex.: um número de
 * WhatsApp Business específico), mediada por uma Connection do Integration Hub. O Channel Account
 * Manager nunca mantém, ele mesmo, a credencial técnica — apenas a referência à Connection.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ChannelAccount {
  /** Identificador do Channel Account. */
  readonly channelAccountId: string;

  /** Tenant ao qual este Channel Account pertence. */
  readonly tenantId: string;

  /** Channel ao qual esta conta pertence. */
  readonly channelId: string;

  /** Referência opaca à Connection mantida pelo Integration Hub — sem redefinir seu contrato. */
  readonly connectionId: string;
}
