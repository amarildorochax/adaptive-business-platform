/**
 * Communication Policy — a regra que rege como e quando um Canal pode ser usado (ex.: restrição de
 * horário de envio, exigência de opt-in prévio); verificada antes de qualquer envio, sem exceção
 * (Blueprint, Capítulo 12 e ADR-012).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface CommunicationPolicy {
  /** Identificador da Policy. */
  readonly policyId: string;

  /** Tenant ao qual esta Policy se aplica. */
  readonly tenantId: string;

  /** Canal ao qual esta Policy se aplica. */
  readonly channelId: string;

  /** Descrição da regra aplicável. */
  readonly description: string;
}
