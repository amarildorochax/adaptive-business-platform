import type { Identity } from './Identity';

/**
 * Credential — o mecanismo que uma Identity utiliza para provar sua identidade (`IDENTITY_HUB.md`,
 * Capítulo 8: "Credenciais são o conjunto de mecanismos que um Usuário utiliza para provar sua
 * identidade — senha, Passkey, chave de API, certificado de federação"). Escopo desta Sprint (per o
 * Roadmap de curto prazo, Capítulo 19): apenas Senha e Passkey — Magic Link, OAuth, OIDC, SAML, API
 * Key e MFA são "médio prazo", nunca implementados aqui.
 *
 * `secretReference` é sempre um valor opaco — nunca a senha em texto plano nem uma chave criptográfica
 * real; este documento nunca implementa autenticação real, apenas o modelo e o contrato (regra
 * explícita desta Sprint).
 */
export type CredentialKind = 'Password' | 'Passkey';

export interface Credential {
  readonly credentialId: string;
  readonly identity: Identity;
  readonly kind: CredentialKind;
  /** Referência opaca ao segredo (hash, ou identificador de chave) — nunca o segredo real. */
  readonly secretReference: string;
  readonly createdAt: Date;
}
