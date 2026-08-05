/**
 * Access Token — a credencial técnica que representa uma Session já autenticada em cada requisição
 * subsequente, administrada pelo Token Manager (`IDENTITY_HUB.md`, Capítulo 7: "emite, valida e
 * revoga tokens de sessão e de acesso"). Adaptado, no formato de campo, de
 * `src/app/integrations/types/AccessToken.ts` — um contrato legado nunca implementado ("preparação
 * arquitetural, sem nenhuma emissão/validação real de token"), mas cuja forma (`value`/`expiresAt`)
 * já antecipava corretamente este mesmo conceito.
 *
 * `value` é sempre um identificador opaco — nunca um JWT real nem qualquer mecanismo criptográfico
 * verdadeiro; esta Sprint nunca implementa emissão real de token (regra explícita desta Sprint).
 * Refresh Token não é modelado nesta Sprint — renovação estende `Session.expiresAt` diretamente
 * (`IDENTITY_HUB.md`, Capítulo 11, "Renovação estende o tempo de vida de uma sessão ativa"), nunca
 * um fluxo de troca de token separado.
 */
export interface AccessToken {
  readonly value: string;
  readonly sessionId: string;
  readonly expiresAt: Date;
}
