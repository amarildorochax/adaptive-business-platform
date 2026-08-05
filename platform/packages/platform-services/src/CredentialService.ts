import type { Credential, CredentialKind } from './Credential';
import type { CredentialRepository } from './CredentialRepository';
import type { Identity } from './Identity';

/**
 * Credential Service — administra Senha e Passkey, os dois mecanismos de curto prazo já definidos
 * pelo Roadmap (`IDENTITY_HUB.md`, Capítulo 19). Nunca compara nem armazena segredo real — apenas a
 * referência opaca (`secretReference`) já resolvida por quem chama (regra explícita desta Sprint:
 * nunca implementar autenticação real).
 */
export class CredentialService {
  constructor(private readonly repository: CredentialRepository) {}

  async register(identity: Identity, kind: CredentialKind, secretReference: string): Promise<Credential> {
    const credential: Credential = { credentialId: crypto.randomUUID(), identity, kind, secretReference, createdAt: new Date() };
    return this.repository.create(credential);
  }

  /**
   * Confirma que `secretReference` corresponde à Credential de `kind` mais recente já registrada —
   * nunca decodifica nem valida um segredo real. A mais recente é sempre a última em ordem de
   * inserção retornada pelo Repository — nunca ordenada por `createdAt`, cuja resolução de
   * milissegundo não garante desempate correto entre dois registros próximos no tempo.
   */
  async matches(identity: Identity, kind: CredentialKind, secretReference: string): Promise<boolean> {
    const credentials = await this.repository.listByIdentity(identity);
    const candidates = credentials.filter((c) => c.kind === kind);
    const current = candidates[candidates.length - 1];

    return current?.secretReference === secretReference;
  }

  async listByIdentity(identity: Identity): Promise<readonly Credential[]> {
    return this.repository.listByIdentity(identity);
  }
}
