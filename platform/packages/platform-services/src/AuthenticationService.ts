import type { AuthenticationResult } from './AuthenticationResult';
import { CredentialService } from './CredentialService';
import type { CredentialKind } from './Credential';
import type { Identity } from './Identity';

/**
 * Authentication Service — "confirma quem está por trás de uma requisição" (`IDENTITY_HUB.md`,
 * Capítulo 2). Escopo desta Sprint: Senha e Passkey, os dois mecanismos de curto prazo (Capítulo 19)
 * — nunca Magic Link, OAuth, OIDC, SAML ou MFA, todos "médio prazo", e nunca uma integração real com
 * nenhum provedor externo (regra explícita desta Sprint).
 *
 * Authentication Before Authorization (`IDENTITY_HUB.md`, ADR-006) — este Service nunca consulta
 * Permissão; apenas confirma identidade.
 */
export class AuthenticationService {
  constructor(private readonly credentials: CredentialService) {}

  async authenticate(identity: Identity, kind: CredentialKind, secretReference: string): Promise<AuthenticationResult> {
    const matches = await this.credentials.matches(identity, kind, secretReference);

    if (!matches) {
      throw new Error(`Falha de autenticação para a Identity "${identity}" — Credential de tipo "${kind}" não corresponde.`);
    }

    return { identity, authenticatedAt: new Date() };
  }
}
