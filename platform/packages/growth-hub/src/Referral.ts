/**
 * Referral — o registro de uma indicação concreta originada dentro de um Referral Program; Referral
 * nunca cria Customer — a criação efetiva de um novo Cliente a partir de um Referral convertido é
 * sempre responsabilidade do CRM Hub, acionada pelo Evento `ReferralConverted` (Blueprint, ADR-003).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Referral {
  /** Identificador do Referral. */
  readonly referralId: string;

  /** Referral Program de origem. */
  readonly referralProgramId: string;

  /** Se este Referral já converteu em novo Cliente. */
  readonly converted: boolean;

  /** Momento do registro. */
  readonly createdAt: Date;
}
