/**
 * Acquisition Channel — modela o canal estratégico de aquisição, distinto do Channel de comunicação
 * já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. Toda comunicação técnica com um canal de mídia
 * externo é mediada exclusivamente pelo Integration Hub — o Growth Hub nunca se comunica diretamente
 * com um Provider de mídia (Blueprint, Capítulo 12).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface AcquisitionChannel {
  /** Identificador do Acquisition Channel. */
  readonly acquisitionChannelId: string;

  /** Nome do canal estratégico. */
  readonly name: string;
}
